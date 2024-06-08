import { chain } from "stream-chain";
import * as fs from "fs";
import { parser } from "stream-json";
import {
  EdgesJSON,
  MetaJSON,
  NodesJSON,
  SnapshotJSON,
  StringsJSON,
  edgesJSONSchema,
  heapSnapshotJSONKeySchema,
  metaJSONSchema,
  nodesJSONSchema,
  snapshotJSONSchema,
  stringsJSONSchema,
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

// N.B. The parser doesn't account for nullValue, trueValue, or falseValue
// tokens and could crash if the heapsnapshot file format is ever changed.

interface WalkTokenCallbacks {
  onSnapshot: (snapshot: SnapshotJSON) => Promise<void>;
  onNodeBatch: (nodes: NodesJSON) => Promise<void>;
  onEdgeBatch: (edges: EdgesJSON) => Promise<void>;
  onStringBatch: (strings: StringsJSON) => Promise<void>;
  // TODO: Implement callbacks for:
  //   - trace_function_infos
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
  const { onSnapshot, onNodeBatch, onEdgeBatch, onStringBatch } = callbacks;

  await assertNextToken(
    queue,
    "startObject",
    "Failed to build heap snapshot. Invalid root object.",
  );

  let nextToken: Token | null = await queue.peek();
  while (nextToken !== null && nextToken.name !== "endObject") {
    const key = await heapSnapshotJSONKeySchema.parseAsync(
      await buildKey(queue),
    );

    switch (key) {
      case "snapshot": {
        const snapshot = await buildSnapshot(queue);
        await onSnapshot(snapshot);
        break;
      }

      case "nodes":
        for await (const nodes of batchBuildArray(queue, buildNumber)) {
          const validatedNodes = await nodesJSONSchema.parseAsync(nodes);
          await onNodeBatch(validatedNodes);
        }
        break;

      case "edges":
        for await (const edges of batchBuildArray(queue, buildNumber)) {
          const validatedEdges = await edgesJSONSchema.parseAsync(edges);
          await onEdgeBatch(validatedEdges);
        }
        break;

      case "strings":
        for await (const strings of batchBuildArray(queue, buildString)) {
          const validatedStrings = await stringsJSONSchema.parseAsync(strings);
          await onStringBatch(validatedStrings);
        }
        break;

      // TODO: Implement these once we understand them better.
      case "trace_function_infos":
      case "trace_tree":
      case "locations":
      case "samples":
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

async function buildMeta(queue: TokenQueue): Promise<MetaJSON> {
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
