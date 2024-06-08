import { TokenParsingError } from "./errors";
import { TokenQueue } from "./tokenQueue";
import { Token } from "./tokens";

export async function buildKey<K extends string>(
  queue: TokenQueue,
): Promise<K> {
  await assertNextToken(queue, "startKey", "Failed to build key.");

  const keyChunks = [];
  let nextToken: Token | null = await queue.peek();
  while (nextToken !== null && nextToken.name !== "endKey") {
    const token = await queue.take();
    if (token === null || token.name !== "stringChunk") {
      throw new TokenParsingError(
        "Failed to build key, got bad string chunk.",
        [token],
      );
    }

    keyChunks.push(token.value);
    nextToken = await queue.peek();
  }
  await assertNextToken(queue, "endKey", "Failed to build key.");

  if (keyChunks.length === 0) {
    throw new TokenParsingError("Failed to build key. No chunks.");
  }
  if ((await queue.peek())?.name === "keyValue") {
    console.warn(
      `Detected a keyValue token. Please set \`packKeys: false\` on the parser for better performance.`,
    );
    await queue.take();
  }

  return keyChunks.join("") as K;
}

// TODO: How can we improve the types here?
export async function buildObject<O extends Record<string, unknown>>(
  queue: TokenQueue,
  valueBuilder: (queue: TokenQueue, key: string) => Promise<unknown>,
): Promise<O> {
  await assertNextToken(queue, "startObject", "Failed to build object.");

  const obj: any = {};
  let nextToken: Token | null = await queue.peek();
  while (nextToken !== null && nextToken.name !== "endObject") {
    const key = await buildKey(queue);
    const value = await valueBuilder(queue, key);
    obj[key] = value;

    nextToken = await queue.peek();
  }

  await assertNextToken(queue, "endObject", "Failed to build object.");
  return obj;
}

export async function buildArray<I>(
  queue: TokenQueue,
  itemBuilder: (queue: TokenQueue, index: number) => Promise<I>,
): Promise<I[]> {
  await assertNextToken(queue, "startArray", "Failed to build array.");

  const items = [];
  let nextToken: Token | null = await queue.peek();
  while (nextToken !== null && nextToken.name !== "endArray") {
    const item = await itemBuilder(queue, items.length);
    items.push(item);
    nextToken = await queue.peek();
  }

  await assertNextToken(queue, "endArray", "Failed to build array.");
  return items;
}

export async function* batchBuildArray<I>(
  queue: TokenQueue,
  itemBuilder: (queue: TokenQueue) => Promise<I>,
  batchSize: number = 1000,
): AsyncGenerator<I[], void, void> {
  await assertNextToken(queue, "startArray", "Failed to batch build array.");

  let items = [];
  let nextToken: Token | null = await queue.peek();
  while (nextToken !== null && nextToken.name !== "endArray") {
    const item = await itemBuilder(queue);
    items.push(item);

    if (items.length >= batchSize) {
      yield items;
      items = [];
    }

    nextToken = await queue.peek();
  }
  await assertNextToken(queue, "endArray", "Failed to batch build array.");

  // Clean up any stragglers.
  if (items.length > 0) {
    yield items;
  }
}

export async function buildString(queue: TokenQueue): Promise<string> {
  await assertNextToken(queue, "startString", "Failed to build string.");

  const stringChunks = [];
  let nextToken: Token | null = await queue.peek();
  while (nextToken !== null && nextToken.name !== "endString") {
    const token = await queue.take();
    if (token === null || token.name !== "stringChunk") {
      throw new TokenParsingError(
        "Failed to build string, got bad string chunk.",
        [token],
      );
    }

    stringChunks.push(token.value);
    nextToken = await queue.peek();
  }
  await assertNextToken(queue, "endString", "Failed to build string.");

  // N.B. Empty strings can have no chunks.

  if ((await queue.peek())?.name === "stringValue") {
    console.warn(
      `Detected a stringValue token. Please set \`packStrings: false\` on the parser for better performance.`,
    );
    await queue.take();
  }

  return stringChunks.join("");
}

export async function buildNumber(queue: TokenQueue): Promise<number> {
  await assertNextToken(queue, "startNumber", "Failed to build number.");

  const numberChunks = [];
  let nextToken: Token | null = await queue.peek();
  while (nextToken !== null && nextToken.name !== "endNumber") {
    const token = await queue.take();
    if (token === null || token.name !== "numberChunk") {
      throw new TokenParsingError(
        "Failed to build number, got bad number chunk.",
        [token],
      );
    }

    numberChunks.push(token.value);
    nextToken = await queue.peek();
  }
  await assertNextToken(queue, "endNumber", "Failed to build number.");

  if (numberChunks.length === 0) {
    throw new TokenParsingError("Failed to build number. No chunks.");
  }
  if ((await queue.peek())?.name === "numberValue") {
    console.warn(
      `Detected a numberValue token. Please set \`packNumbers: false\` on the parser for better performance.`,
    );
    await queue.take();
  }

  const stringNumber = numberChunks.join("");
  return Number(stringNumber);
}

export async function assertNextToken(
  queue: TokenQueue,
  name: Token["name"],
  message: string,
): Promise<void> {
  const nextToken = await queue.take();
  if (nextToken === null || nextToken.name !== name) {
    throw new TokenParsingError(`${message} No ${name} token.`, [nextToken]);
  }
}
