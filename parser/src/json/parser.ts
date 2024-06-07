import { chain } from "stream-chain";
import * as fs from "fs";
import { parser } from "stream-json";
import {
  EdgeFields,
  EdgeTypes,
  HeapSnapshot,
  Meta,
  NodeFields,
  NodeTypes,
  Snapshot,
} from "./snapshot";
import { Token } from "./tokens";
import { InvalidJSONError, TokenParsingError } from "./errors";
import {
  buildKey,
  buildNumber,
  buildString,
  buildArray,
  batchBuildArray,
} from "./utils";
import { TokenQueue } from "./tokenQueue";

// N.B. The parser doesn't account for nullValue, trueValue, or falseValue tokens
// and could crash if the heapsnapshot file format is ever changed.

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
    parser({ packStrings: false, packNumbers: false }),
    token => tokenQueue.onToken(token),
  ]);

  console.log("start walking tokens");
  pipeline.on("end", () => tokenQueue.setIsDraining());
  await walkTokens(tokenQueue, callbacks);
}

async function walkTokens(
  queue: TokenQueue,
  callbacks: WalkTokenCallbacks,
): Promise<void> {
  const { onSnapshot, onNodeBatch, onEdgeBatch, onStringBatch } = callbacks;

  let firstToken = await queue.take();
  if (firstToken === null || firstToken.name !== "startObject") {
    throw new Error("Bad heap snapshot file. Root object is invalid.");
  }

  while (!queue.isEmpty() && (await queue.peek())?.name !== "endObject") {
    const nextToken = await queue.peek();
    if (nextToken === null) {
      throw new Error("Next token was null.");
    }

    switch (nextToken.name) {
      case "startKey":
        const key = await buildKey<keyof HeapSnapshot>(queue);

        switch (key) {
          case "snapshot":
            await assertKeyValueToken(queue, "snapshot");
            await buildSnapshot(queue, onSnapshot);
            break;
          case "nodes":
            await assertKeyValueToken(queue, "nodes");
            for await (let nodes of batchBuildArray(queue, buildNumber)) {
              await onNodeBatch(nodes);
            }
            break;

          case "edges":
            await assertKeyValueToken(queue, "edges");
            for await (let nodes of batchBuildArray(queue, buildNumber)) {
              await onEdgeBatch(nodes);
            }
            break;

          case "strings":
            await assertKeyValueToken(queue, "strings");
            for await (let nodes of batchBuildArray(queue, buildString)) {
              await onStringBatch(nodes);
            }
            break;

          // TODO: Implement these
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

  //Remove endObject token from queue.
  await queue.take();
}

export async function buildSnapshot(
  queue: TokenQueue,
  callback: WalkTokenCallbacks["onSnapshot"],
): Promise<void> {
  let firstToken = await queue.take();
  if (firstToken === null || firstToken.name !== "startObject") {
    throw new TokenParsingError(
      "Bad snapshot file. Snapshot object is invalid.",
      [firstToken],
    );
  }

  const snapshot: Partial<Snapshot> = {};

  while (!queue.isEmpty() && (await queue.peek())?.name !== "endObject") {
    const nextToken = await queue.peek();
    if (nextToken === null) {
      throw new Error("Next token was null.");
    }
    if (nextToken.name !== "startKey") {
      throw new TokenParsingError("Expected startKey token within object", [
        nextToken,
      ]);
    }

    switch (nextToken.name) {
      case "startKey":
        const key = await buildKey<keyof Snapshot>(queue);
        console.log("buildSnapshot. Key: ", key);

        switch (key) {
          case "meta":
            console.log("Start meta");
            await assertKeyValueToken(queue, "meta");
            snapshot.meta = await buildMeta(queue);
            console.log("keep goiong");
            break;

          case "node_count":
          case "edge_count":
          case "trace_function_count":
            await assertKeyValueToken(queue, key);
            snapshot[key] = await buildNumber(queue);
            break;

          default:
            throw new Error(`Unexpected snapshot key: ${key}`);
        }

        break;
    }
  }

  //Remove endObject token from queue.
  await queue.take();

  if (!isSnapshot(snapshot)) {
    throw new InvalidJSONError("Failed to build snapshot.", snapshot);
  }

  console.log("Done building snapshot");
  await callback(snapshot);
}

function isSnapshot(obj: Partial<Snapshot>): obj is Snapshot {
  return (
    obj.meta !== undefined &&
    obj.node_count !== undefined &&
    obj.edge_count !== undefined &&
    obj.trace_function_count !== undefined
  );
}

async function buildMeta(queue: TokenQueue): Promise<Meta> {
  console.log("buildMeta");
  const meta: Partial<Meta> = {};

  // Remove "startObject" token off queue.
  await queue.take();

  while (!queue.isEmpty() && (await queue.peek())?.name !== "endObject") {
    const key = await buildKey<keyof Meta>(queue);
    console.log(`buildMeta. key: "${key}"`, key);

    switch (key) {
      case "node_fields":
        await assertKeyValueToken(queue, "node_fields");
        meta.node_fields = (await buildArray(queue, buildString)) as NodeFields;
        break;
      case "node_types":
        await assertKeyValueToken(queue, "node_types");
        meta.node_types = await buildNodeTypes(queue);
        break;

      case "edge_fields":
        await assertKeyValueToken(queue, "edge_fields");
        meta.edge_fields = (await buildArray(queue, buildString)) as EdgeFields;
        break;

      case "edge_types":
        await assertKeyValueToken(queue, "edge_types");
        meta.edge_types = await buildEdgeTypes(queue);
        break;

      case "trace_function_info_fields":
        await assertKeyValueToken(queue, "trace_function_info_fields");
        meta.trace_function_info_fields = await buildArray(queue, buildString);
        break;

      case "trace_node_fields":
        await assertKeyValueToken(queue, "trace_node_fields");
        meta.trace_node_fields = await buildArray(queue, buildString);
        break;

      case "sample_fields":
        await assertKeyValueToken(queue, "sample_fields");
        meta.trace_node_fields = await buildArray(queue, buildString);
        break;

      case "location_fields":
        await assertKeyValueToken(queue, "location_fields");
        meta.trace_node_fields = await buildArray(queue, buildString);
        break;

      default:
        throw new Error(`Unexpected meta key: ${key}`);
    }
  }

  //Remove endObject token from queue.
  await queue.take();

  if (!isMeta(meta)) {
    throw new InvalidJSONError("Failed to build meta.", meta);
  }

  console.log("Finished meta!");
  return meta;
}

function isMeta(obj: Partial<Meta>): obj is Meta {
  return (
    obj.node_fields !== undefined &&
    obj.node_types !== undefined &&
    obj.edge_fields !== undefined &&
    obj.edge_types !== undefined
  );
}

export async function assertKeyValueToken(
  queue: TokenQueue,
  key: string,
): Promise<void> {
  const keyValueToken = await queue.take();
  if (
    keyValueToken === null ||
    keyValueToken.name !== "keyValue" ||
    keyValueToken.value !== key
  ) {
    throw new Error(`Missing key value token ${key}.`);
  }
}

export async function buildNodeTypes(queue: TokenQueue): Promise<NodeTypes> {
  console.log("buildNodeTypes()");

  const startArray = await queue.take();
  if (startArray?.name !== "startArray") {
    throw new TokenParsingError(
      "Failed to build node types. Array didn't start with startArray token.",
      [startArray],
    );
  }

  let nodeTypes: any = [];

  // First element is a nested array
  const nested = await buildArray(queue, buildString);
  nodeTypes.push(nested);

  let nextToken: Token | null = null;
  do {
    console.log("string!");
    const string = await buildString(queue);
    nodeTypes.push(string);
    nextToken = await queue.peek();
  } while (nextToken !== null && nextToken.name !== "endArray");

  // Remove endArray token from queue.
  await queue.take();

  return nodeTypes;
}

export async function buildEdgeTypes(queue: TokenQueue): Promise<EdgeTypes> {
  console.log("buildEdgeTypes()");

  const startArray = await queue.take();
  if (startArray?.name !== "startArray") {
    throw new TokenParsingError(
      "Failed to build node types. Array didn't start with startArray token.",
      [startArray],
    );
  }

  let edgeTypes: any = [];

  // First element is a nested array
  const nested = await buildArray(queue, buildString);
  edgeTypes.push(nested);

  let nextToken: Token | null = null;
  do {
    console.log("string!");
    const string = await buildString(queue);
    edgeTypes.push(string);
    nextToken = await queue.peek();
  } while (nextToken !== null && nextToken.name !== "endArray");

  // Remove endArray token from queue.
  await queue.take();

  return edgeTypes;
}
