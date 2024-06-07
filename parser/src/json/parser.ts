import { chain } from "stream-chain";
import * as fs from "fs";
import { parser } from "stream-json";
import { pick } from "stream-json/filters/Pick";
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
import { EventEmitter } from "stream";

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

  console.log("Prep pipeline!");
  const pipeline = chain([
    fs.createReadStream(path),
    parser({ packStrings: false }),
    token => tokenQueue.onToken(token),
  ]);

  console.log("start walking tokens");
  pipeline.on("end", () => tokenQueue.setIsDraining());
  await walkTokens(tokenQueue, callbacks);
}

export class TokenQueue {
  #isDraining: boolean;
  #tokenCache: Token[];
  #eventEmitter: EventEmitter;

  constructor() {
    this.#isDraining = false;
    this.#tokenCache = [];
    this.#eventEmitter = new EventEmitter();
  }

  async onToken(token: Token): Promise<void> {
    this.#tokenCache.push(token);
    this.#eventEmitter.emit("token", token);
  }

  async peek(): Promise<Token | null> {
    if (this.isEmpty()) {
      return null;
    }

    // Wait for a token to come in if there's nothing in the cache.
    if (this.#tokenCache.length === 0) {
      await new Promise(res => {
        this.#eventEmitter.once("token", res);
      });
    }

    return this.#tokenCache[0]!;
  }

  async take(): Promise<Token | null> {
    if (this.isEmpty()) {
      console.log("Queue is empty! Return null.");
      return null;
    }

    // Wait for a token to come in if there's nothing in the cache.
    if (this.#tokenCache.length === 0) {
      await new Promise(res => {
        this.#eventEmitter.once("token", res);
      });
    }

    return this.#tokenCache.shift()!;
  }

  async takeUntil(until: (t: Token) => boolean): Promise<Token[]> {
    const tokens: Token[] = [];

    while (!this.isEmpty()) {
      let next = (await this.peek())!;
      if (until(next)) {
        tokens.push((await this.take())!);
        break;
      }

      tokens.push((await this.take())!);
    }

    return tokens;
  }

  isEmpty(): boolean {
    if (this.#isDraining) {
      return this.#tokenCache.length === 0;
    }

    return false;
  }

  setIsDraining(): void {
    if (this.#isDraining) {
      throw new Error("Cannot mark draining token queue as draining.");
    }

    this.#isDraining = true;
  }
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

  while (!queue.isEmpty()) {
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
            for await (let nodes of batchBuildNumberArray(queue)) {
              await onNodeBatch(nodes);
            }
            break;

          case "edges":
            await assertKeyValueToken(queue, "edges");
            for await (let nodes of batchBuildNumberArray(queue)) {
              await onEdgeBatch(nodes);
            }
            break;

          case "strings":
            await assertKeyValueToken(queue, "strings");
            for await (let nodes of batchBuildStringArray(queue)) {
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
}

export async function buildSnapshot(
  queue: TokenQueue,
  callback: WalkTokenCallbacks["onSnapshot"],
): Promise<void> {
  let firstToken = await queue.take();
  if (firstToken === null || firstToken.name !== "startObject") {
    throw new Error("Bad snapshot file. Snapshot object is invalid.");
  }

  const snapshot: Partial<Snapshot> = {};

  while (!queue.isEmpty()) {
    const nextToken = await queue.peek();
    if (nextToken === null) {
      throw new Error("Next token was null.");
    }

    switch (nextToken.name) {
      case "startKey":
        const key = await buildKey<keyof Snapshot>(queue);
        console.log("buildSnapshot. Key: ", key);

        switch (key) {
          case "meta":
            await assertKeyValueToken(queue, "meta");
            snapshot.meta = await buildMeta(queue);
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

  if (!isSnapshot(snapshot)) {
    throw new Error("Failed to build snapshot.");
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

  while (!queue.isEmpty()) {
    const key = await buildKey<keyof Meta>(queue);
    console.log(`buildMeta. key: "${key}"`, key);

    switch (key) {
      case "node_fields":
        await assertKeyValueToken(queue, "node_fields");
        meta.node_fields = (await buildStringArray(
          queue,
        )) as unknown as NodeFields;
        break;
      case "node_types":
        await assertKeyValueToken(queue, "node_types");
        meta.node_types = (await buildStringArray(
          queue,
        )) as unknown as NodeTypes;
        break;

      case "edge_fields":
        await assertKeyValueToken(queue, "edge_fields");
        meta.edge_fields = (await buildStringArray(
          queue,
        )) as unknown as EdgeFields;
        break;

      case "edge_types":
        await assertKeyValueToken(queue, "edge_types");
        meta.edge_types = (await buildStringArray(
          queue,
        )) as unknown as EdgeTypes;
        break;

      default:
        throw new Error(`Unexpected meta key: ${key}`);
    }
  }

  if (!isMeta(meta)) {
    throw new Error("Failed to build meta.");
  }

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

export async function buildKey<K extends string>(
  queue: TokenQueue,
): Promise<K> {
  const keyTokens = await queue.takeUntil(t => t.name === "endKey");
  if (
    keyTokens[0].name !== "startKey" &&
    keyTokens[keyTokens.length - 1].name !== "endKey"
  ) {
    throw new UnexpectedTokensError("Failed to build key.", keyTokens);
  }

  let key = [];
  const keyChunks = keyTokens.slice(1, -1);
  for (const chunk of keyChunks) {
    if (chunk.name !== "stringChunk") {
      throw new UnexpectedTokensError("Failed to build key", keyChunks);
    }

    key.push(chunk.value);
  }

  return key.join() as K;
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

export async function buildNumberArray(queue: TokenQueue): Promise<number[]> {
  const startArray = await queue.take();
  if (startArray === null || startArray.name !== "startArray") {
    throw new Error("Failed to parse number array.");
  }

  const numbers = [];
  let nextToken: Token | null = null;
  do {
    const stringNumber = await buildNumber(queue);
    numbers.push(Number(stringNumber));
    nextToken = await queue.peek();
  } while (nextToken !== null && nextToken.name !== "endArray");

  return numbers;
}

export async function* batchBuildNumberArray(
  queue: TokenQueue,
  batchSize: number = 1000,
): AsyncGenerator<number[], void, void> {
  let numbers = [];
  let nextToken: Token | null = null;
  do {
    const stringNumber = await buildString(queue);
    numbers.push(Number(stringNumber));

    if (numbers.length >= batchSize) {
      yield numbers;
      numbers = [];
    }

    nextToken = await queue.peek();
  } while (nextToken !== null && nextToken.name !== "endArray");
}

export async function buildStringArray(queue: TokenQueue): Promise<string[]> {
  const startArray = await queue.take();
  if (startArray?.name !== "startArray") {
    throw new Error(
      "Failed to build string array. Array didn't start with startArray token.",
    );
  }

  const strings = [];
  let nextToken: Token | null = null;
  do {
    const string = await buildString(queue);
    strings.push(string);
    nextToken = await queue.peek();
  } while (nextToken !== null && nextToken.name !== "endArray");

  console.log("DONE: ", strings);
  return strings;
}

export async function* batchBuildStringArray(
  queue: TokenQueue,
  batchSize: number = 1000,
): AsyncGenerator<string[], void, void> {
  let strings = [];
  let nextToken: Token | null = null;
  do {
    const string = await buildString(queue);
    strings.push(string);

    if (strings.length >= batchSize) {
      yield strings;
      strings = [];
    }

    nextToken = await queue.peek();
  } while (nextToken !== null && nextToken.name !== "endArray");
}

export async function buildString(queue: TokenQueue): Promise<string> {
  const stringTokens = await queue.takeUntil(t => t.name === "endString");
  if (
    stringTokens[0].name !== "startString" &&
    stringTokens[stringTokens.length - 1].name !== "endString"
  ) {
    throw new UnexpectedTokensError("Failed to build string.", stringTokens);
  }

  const stringChunks = stringTokens.slice(1, -1);
  const string = [];
  for (const chunk of stringChunks) {
    if (chunk.name !== "stringChunk") {
      throw new UnexpectedTokensError(
        "Failed to build string. Bad chunks.",
        stringChunks,
      );
    }

    string.push(chunk.value);
  }

  return string.join();
}

export async function buildNumber(queue: TokenQueue): Promise<number> {
  const numberTokens = await queue.takeUntil(t => t.name === "endNumber");
  if (
    numberTokens[0].name !== "startNumber" &&
    numberTokens[numberTokens.length - 1].name !== "endNumber"
  ) {
    throw new Error("Failed to build number.");
  }

  const numberChunks = numberTokens.slice(1, -1);
  for (const chunk of numberChunks) {
    if (chunk.name !== "stringChunk") {
      throw new Error("Failed to build string.");
    }
  }

  const stringNumber = numberChunks.join();
  return Number(stringNumber);
}

class UnexpectedTokensError extends Error {
  constructor(message: string, tokens: Token[]) {
    const fullMessage = `${message} Tokens: [${tokens
      .map(t => t.name)
      .join(", ")}]`;
    super(fullMessage);
  }
}
