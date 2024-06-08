import { chain } from "stream-chain";
import * as fs from "fs";
import { parser } from "stream-json";
import { HeapSnapshot, Meta, Snapshot } from "./snapshot";
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
  onSnapshot: (snapshot: HeapSnapshot["snapshot"]) => Promise<void>;
  onNodeBatch: (nodes: HeapSnapshot["nodes"]) => Promise<void>;
  onEdgeBatch: (edges: HeapSnapshot["edges"]) => Promise<void>;
  onStringBatch: (strings: HeapSnapshot["strings"]) => Promise<void>;
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

  // TODO: Add validation!

  let nextToken: Token | null = await queue.peek();
  while (nextToken !== null && nextToken.name !== "endObject") {
    switch (nextToken.name) {
      case "startKey": {
        const key = await buildKey<keyof HeapSnapshot>(queue);

        switch (key) {
          case "snapshot": {
            const snapshot = await buildSnapshot(queue);
            await onSnapshot(snapshot);
            break;
          }

          case "nodes":
            for await (const nodes of batchBuildArray(queue, buildNumber)) {
              await onNodeBatch(nodes);
            }
            break;

          case "edges":
            for await (const edges of batchBuildArray(queue, buildNumber)) {
              await onEdgeBatch(edges);
            }
            break;

          case "strings":
            for await (const strings of batchBuildArray(queue, buildString)) {
              await onStringBatch(strings);
            }
            break;

          // TODO: Implement these once we understand them better.
          case "trace_function_infos":
          case "trace_tree":
          case "locations":
          case "samples":
            break;

          default:
            throw new Error(`Unexpected root key: ${key}`);
        }

        break;
      }
    }

    nextToken = await queue.take();
  }

  await assertNextToken(
    queue,
    "endObject",
    "Failed to build heap snapshot. Invalid root object.",
  );
}

export async function buildSnapshot(queue: TokenQueue): Promise<Snapshot> {
  const obj = await buildObject(queue, async (q, key) => {
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

  // TODO: Add validation!

  return obj as unknown as Snapshot;
}

async function buildMeta(queue: TokenQueue): Promise<Meta> {
  const obj = await buildObject(queue, async (q, key) => {
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

  // TODO: Add validation!

  return obj as unknown as Meta;
}

export async function buildStringArrayWithNestedArray(
  queue: TokenQueue,
): Promise<[string[], ...string[]]> {
  const array = await buildArray(queue, async (q, i) => {
    if (i === 0) {
      return buildArray(q, buildString);
    } else {
      return buildString(q);
    }
  });

  return array as [string[], ...string[]];
}
