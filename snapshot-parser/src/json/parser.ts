import * as fs from "fs";
import * as sj from "stream-json";
import {
  EdgeJSON,
  MetaJSON,
  NodeJSON,
  SnapshotJSON,
  edgeJSONSchema,
  heapSnapshotJSONKeySchema,
  locationsJSONSchema,
  metaJSONSchema,
  nodeJSONSchema,
  samplesJSONSchema,
  snapshotJSONSchema,
  stringsJSONSchema,
  traceFunctionInfosJSONSchema,
  traceTreesJSONSchema,
} from "./schema.js";
import { Token } from "./tokens.js";
import {
  buildKey,
  buildNumber,
  buildString,
  buildArray,
  batchBuildArray,
  assertNextToken,
  buildObject,
} from "./utils.js";
import { TokenQueue } from "./tokenQueue.js";
import _ from "lodash";
import sc from "stream-chain";

// N.B. The parser doesn't account for nullValue, trueValue, or falseValue
// tokens and could crash if the heapsnapshot file format is ever changed to use
// null, false, or true literals.

const NODE_BATCH_SIZE = 1000;
const EDGE_BATCH_SIZE = 1000;
const STRING_BATCH_SIZE = 1000;
const TRACE_FUNCTION_INFO_BATCH_SIZE = 1000;
const TRACE_TREE_BATCH_SIZE = 1000;
const SAMPLES_BATCH_SIZE = 1000;
const LOCATIONS_BATCH_SIZE = 1000;

interface WalkTokenCallbacks {
  onSnapshot?: (snapshot: SnapshotJSON) => Promise<void>;
  onNodeBatch?: (nodes: NodeJSON[], offset: number) => Promise<void>;
  onEdgeBatch?: (edges: EdgeJSON[], offset: number) => Promise<void>;
  onStringBatch?: (strings: string[], offset: number) => Promise<void>;
  onTraceFunctionInfoBatch?: (
    traceFunctionInfos: number[],
    offset: number,
  ) => Promise<void>;
  onTraceTreeBatch?: (traceTrees: number[], offset: number) => Promise<void>;
  onSampleBatch?: (samples: number[], offset: number) => Promise<void>;
  onLocationBatch?: (samples: number[], offset: number) => Promise<void>;
}

export async function parseSnapshotFile(
  path: string,
  callbacks: WalkTokenCallbacks,
): Promise<void> {
  const tokenQueue = new TokenQueue();

  const pipeline = sc.chain([
    fs.createReadStream(path),
    sj.default.parser({
      packKeys: false,
      packStrings: false,
      packNumbers: false,
    }),
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
    onTraceFunctionInfoBatch: onTraceFunctionInfos,
    onTraceTreeBatch: onTraceTrees,
    onLocationBatch: onLocations,
    onSampleBatch: onSamples,
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
        if (onSnapshot) {
          await onSnapshot(snapshot);
        }
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
          if (onNodeBatch) {
            await onNodeBatch(nodeFieldValues, offset);
          }
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
          if (onEdgeBatch) {
            await onEdgeBatch(edgeFieldValues, offset);
          }
        }
        break;
      }

      case "strings": {
        for await (const [strings, offset] of batchBuildArray(
          queue,
          buildString,
          STRING_BATCH_SIZE,
        )) {
          if (onStringBatch) {
            const validatedStrings =
              await stringsJSONSchema.parseAsync(strings);
            await onStringBatch(validatedStrings, offset);
          }
        }
        break;
      }

      case "trace_function_infos": {
        for await (const [traceFunctionInfos, offset] of batchBuildArray(
          queue,
          buildNumber,
          TRACE_FUNCTION_INFO_BATCH_SIZE,
        )) {
          if (onTraceFunctionInfos) {
            const validatedFunctionInfos =
              await traceFunctionInfosJSONSchema.parseAsync(traceFunctionInfos);
            await onTraceFunctionInfos(validatedFunctionInfos, offset);
          }
        }
        break;
      }

      case "trace_tree": {
        for await (const [traceTrees, offset] of batchBuildArray(
          queue,
          buildNumber,
          TRACE_TREE_BATCH_SIZE,
        )) {
          if (onTraceTrees) {
            const validatedTraceTrees =
              await traceTreesJSONSchema.parseAsync(traceTrees);
            await onTraceTrees(validatedTraceTrees, offset);
          }
        }
        break;
      }

      case "locations": {
        for await (const [locations, offset] of batchBuildArray(
          queue,
          buildNumber,
          LOCATIONS_BATCH_SIZE,
        )) {
          if (onLocations) {
            const validatedLocations =
              await locationsJSONSchema.parseAsync(locations);
            await onLocations(validatedLocations, offset);
          }
        }
        break;
      }

      case "samples": {
        for await (const [samples, offset] of batchBuildArray(
          queue,
          buildNumber,
          SAMPLES_BATCH_SIZE,
        )) {
          const validatedSamples = await samplesJSONSchema.parseAsync(samples);
          await onSamples?.(validatedSamples, offset);
        }
        break;
      }
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
  const batchSize = nodeFieldCount * nodeBatchSize;
  for await (const [nodes, offset] of batchBuildArray(
    queue,
    buildNumber,
    batchSize,
  )) {
    const validatedNodes = await nodeJSONSchema.parseAsync(nodes);
    const chunkedNodeFieldValues = _.chunk(validatedNodes, nodeFieldCount);

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
  const batchSize = edgeFieldCount * edgeBatchSize;
  for await (const [edges, offset] of batchBuildArray(
    queue,
    buildNumber,
    batchSize,
  )) {
    const validatedEdges = await edgeJSONSchema.parseAsync(edges);
    const chunkedEdgeFieldValues = _.chunk(validatedEdges, edgeFieldCount);

    yield [chunkedEdgeFieldValues, offset];
  }
}
