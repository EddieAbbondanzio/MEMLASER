import { chain } from "stream-chain";
import * as fs from "fs";
import { parser } from "stream-json";
import {
  EdgeJSON,
  MetaJSON,
  NodeJSON,
  SnapshotJSON,
  edgeJSONSchema,
  heapSnapshotJSONKeySchema,
  metaJSONSchema,
  nodeJSONSchema,
  snapshotJSONSchema,
  stringsJSONSchema,
  traceFunctionInfosJSONSchema,
} from "./schema";
import { Token } from "./tokens";
import {
  buildKey,
  buildNumber,
  buildString,
  buildArray,
  batchBuildArray,
  assertNextToken,
  buildObject,
} from "./utils";
import { TokenQueue } from "./tokenQueue";
import { chunk } from "lodash";

// N.B. The parser doesn't account for nullValue, trueValue, or falseValue
// tokens and could crash if the heapsnapshot file format is ever changed to use
// null, false, or true literals.

const NODE_BATCH_SIZE = 1000;
const EDGE_BATCH_SIZE = 1000;
const STRING_BATCH_SIZE = 1000;
const TRACE_FUNCTION_INFO_BATCH_SIZE = 1000;

interface WalkTokenCallbacks {
  onSnapshot: (snapshot: SnapshotJSON) => Promise<void>;
  onNodeBatch: (nodes: NodeJSON[], offset: number) => Promise<void>;
  onEdgeBatch: (edges: EdgeJSON[], offset: number) => Promise<void>;
  onStringBatch: (strings: string[], offset: number) => Promise<void>;
  onTraceFunctionInfos: (strings: number[], offset: number) => Promise<void>;
  // TODO: Implement callbacks for:
  //   - trace_tree
  //   - samples
  //   - locations
}

export async function parseSnapshotFile(
  path: string,
  callbacks: WalkTokenCallbacks,
): Promise<void> {
  const tokenQueue = new TokenQueue();

  const pipeline = chain([
    fs.createReadStream(path),
    parser({ packKeys: false, packStrings: false, packNumbers: false }),
    token => tokenQueue.onToken(token),
  ]);

  pipeline.on("end", () => tokenQueue.setIsDraining());
  await buildHeapSnapshot(tokenQueue, callbacks);
}

async function buildHeapSnapshot(
  queue: TokenQueue,
  callbacks: WalkTokenCallbacks,
): Promise<void> {
  const {
    onSnapshot,
    onNodeBatch,
    onEdgeBatch,
    onStringBatch,
    onTraceFunctionInfos,
  } = callbacks;
  await assertNextToken(
    queue,
    "startObject",
    "Failed to build heap snapshot. Invalid root object.",
  );

  let snapshot: SnapshotJSON | null = null;

  let nextToken: Token | null = await queue.peek();
  while (nextToken !== null && nextToken.name !== "endObject") {
    const key = await heapSnapshotJSONKeySchema.parseAsync(
      await buildKey(queue),
    );

    switch (key) {
      case "snapshot": {
        snapshot = await buildSnapshot(queue);
        await onSnapshot(snapshot);
        break;
      }

      case "nodes": {
        if (snapshot === null) {
          throw new Error("Missing snapshot data. Can't build nodes.");
        }

        for await (const [nodeFieldValues, offset] of buildNodeFieldValues(
          queue,
          snapshot,
          NODE_BATCH_SIZE,
        )) {
          await onNodeBatch(nodeFieldValues, offset);
        }
        break;
      }

      case "edges": {
        if (snapshot === null) {
          throw new Error("Missing snapshot data. Can't build edges.");
        }

        for await (const [edgeFieldValues, offset] of buildEdgeFieldValues(
          queue,
          snapshot,
          EDGE_BATCH_SIZE,
        )) {
          await onEdgeBatch(edgeFieldValues, offset);
        }
        break;
      }

      case "strings": {
        for await (const [strings, offset] of batchBuildArray(
          queue,
          buildString,
          STRING_BATCH_SIZE,
        )) {
          const validatedStrings = await stringsJSONSchema.parseAsync(strings);
          await onStringBatch(validatedStrings, offset);
        }
        break;
      }

      case "trace_function_infos": {
        for await (const [traceFunctionInfos, offset] of batchBuildArray(
          queue,
          buildNumber,
          TRACE_FUNCTION_INFO_BATCH_SIZE,
        )) {
          const validatedFunctionInfos =
            await traceFunctionInfosJSONSchema.parseAsync(traceFunctionInfos);
          await onTraceFunctionInfos(validatedFunctionInfos, offset);
        }
        break;
      }

      case "trace_tree":
      case "locations":
      case "samples":
        for await (const _ of batchBuildArray(queue, buildNumber)) {
          // Feels bad doing nothing, but we don't know how to process these yet.
        }
        break;
    }

    nextToken = await queue.peek();
  }

  await assertNextToken(
    queue,
    "endObject",
    "Failed to build heap snapshot. Invalid root object.",
  );
}

export async function buildSnapshot(queue: TokenQueue): Promise<SnapshotJSON> {
  const raw = await buildObject(queue, async (q, key) => {
    switch (key) {
      case "meta":
        return await buildMeta(q);
      case "node_count":
      case "edge_count":
      case "trace_function_count":
        return await buildNumber(q);
      default:
        throw new Error(`Unexpected snapshot key: ${key}`);
    }
  });

  const validated = await snapshotJSONSchema.parseAsync(raw);
  return validated;
}

export async function buildMeta(queue: TokenQueue): Promise<MetaJSON> {
  const raw = await buildObject(queue, async (q, key) => {
    switch (key) {
      case "node_types":
      case "edge_types":
        return await buildStringArrayWithNestedArray(q);
      case "trace_function_info_fields":
      case "trace_node_fields":
      case "sample_fields":
      case "location_fields":
      case "node_fields":
      case "edge_fields":
        return await buildArray(q, buildString);
      default:
        throw new Error(`Unexpected meta key: ${key}`);
    }
  });

  const validated = await metaJSONSchema.parseAsync(raw);
  return validated;
}

async function buildStringArrayWithNestedArray(
  queue: TokenQueue,
): Promise<[string[], ...string[]]> {
  const array = await buildArray(queue, async (q, i) => {
    if (i === 0) {
      return buildArray(q, buildString);
    } else {
      return buildString(q);
    }
  });

  // We validate in buildMeta, so we can skip validation here.
  return array as [string[], ...string[]];
}

export async function* buildNodeFieldValues(
  queue: TokenQueue,
  snapshot: SnapshotJSON,
  nodeBatchSize: number,
): AsyncGenerator<[NodeJSON[], number], void, void> {
  // The nodes in a snapshot file represent the various JS objects in the heap.
  // They are stored in a flat integer array where each integer represents the
  // value of a field. In order to parse them, the number of node fields must
  // be known so we can divide the array into chunks that represent individual
  // nodes.
  const nodeFieldCount = snapshot.meta.node_fields.length;
  if (snapshot.node_count % nodeFieldCount !== 0) {
    throw new Error(
      `Unable to process nodes. Number of nodes (${snapshot.node_count}) is not divisible by field count (${nodeFieldCount}).`,
    );
  }

  const batchSize = nodeFieldCount * nodeBatchSize;
  for await (const [nodes, offset] of batchBuildArray(
    queue,
    buildNumber,
    batchSize,
  )) {
    const validatedNodes = await nodeJSONSchema.parseAsync(nodes);
    const chunkedNodeFieldValues = chunk(validatedNodes, nodeFieldCount);

    yield [chunkedNodeFieldValues, offset];
  }
}

export async function* buildEdgeFieldValues(
  queue: TokenQueue,
  snapshot: SnapshotJSON,
  edgeBatchSize: number,
): AsyncGenerator<[EdgeJSON[], number], void, void> {
  // The edges in a snapshot file represent the references between JS objects.
  // Edges are one directional (ex: const foo = { bar: {} } would have 1 edge
  // pointing from node foo to bar). Like nodes they are stored in 1d array and
  // the array must be broken into chunks that represent a single edge.
  const edgeFieldCount = snapshot.meta.edge_fields.length;
  if (snapshot.edge_count % edgeFieldCount !== 0) {
    throw new Error(
      "Unable to process edge. Number of edges is not divisible by field count.",
    );
  }

  const batchSize = edgeFieldCount * edgeBatchSize;
  for await (const [edges, offset] of batchBuildArray(
    queue,
    buildNumber,
    batchSize,
  )) {
    const validatedEdges = await edgeJSONSchema.parseAsync(edges);
    const chunkedEdgeFieldValues = chunk(validatedEdges, edgeFieldCount);

    yield [chunkedEdgeFieldValues, offset];
  }
}
