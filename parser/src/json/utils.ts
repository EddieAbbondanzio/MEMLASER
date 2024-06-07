import { TokenParsingError } from "./errors";
import { TokenQueue } from "./tokenQueue";
import { Token } from "./tokens";

export async function buildKey<K extends string>(
  queue: TokenQueue,
): Promise<K> {
  const keyTokens = await queue.takeUntil(t => t.name === "endKey");
  if (
    keyTokens[0].name !== "startKey" ||
    keyTokens[keyTokens.length - 1].name !== "endKey"
  ) {
    throw new TokenParsingError("Failed to build key.", keyTokens);
  }

  let key = [];
  const keyChunks = keyTokens.slice(1, -1);
  for (const chunk of keyChunks) {
    if (chunk.name !== "stringChunk") {
      throw new TokenParsingError(
        "Failed to build key, got bad string chunk.",
        keyChunks,
      );
    }

    key.push(chunk.value);
  }

  if (keyChunks.length === 0) {
    throw new TokenParsingError("Failed to build key. No chunks.");
  }

  const fullKey = key.join("") as K;

  if ((await queue.peek())?.name === "keyValue") {
    console.warn(
      `Detected a keyValue token for key "${fullKey}". Please set \`packKeys: false\` on the parser for better performance.`,
    );
    await queue.take();
  }

  return fullKey;
}

export async function buildArray<I>(
  queue: TokenQueue,
  itemBuilder: (queue: TokenQueue) => Promise<I>,
): Promise<I[]> {
  const startArray = await queue.take();
  if (startArray === null || startArray.name !== "startArray") {
    throw new TokenParsingError("Failed to build array. No startArray token.", [
      startArray,
    ]);
  }

  const items = [];
  let nextToken: Token | null = null;
  do {
    const item = await itemBuilder(queue);
    items.push(item);

    nextToken = await queue.peek();
  } while (nextToken !== null && nextToken.name !== "endArray");

  const endArray = await queue.take();
  if (endArray === null || endArray.name !== "endArray") {
    throw new TokenParsingError("Failed to build array. No endArray token.", [
      endArray,
    ]);
  }

  return items;
}

export async function* batchBuildArray<I>(
  queue: TokenQueue,
  itemBuilder: (queue: TokenQueue) => Promise<I>,
  batchSize: number = 1000,
): AsyncGenerator<I[], void, void> {
  const startArray = await queue.take();
  if (startArray === null || startArray.name !== "startArray") {
    throw new TokenParsingError("Failed to build array. No startArray token.", [
      startArray,
    ]);
  }

  let items = [];
  let nextToken: Token | null = null;
  do {
    const item = await itemBuilder(queue);
    items.push(item);

    if (items.length >= batchSize) {
      yield items;
      items = [];
    }

    nextToken = await queue.peek();
  } while (nextToken !== null && nextToken.name !== "endArray");

  const endArray = await queue.take();
  if (endArray === null || endArray.name !== "endArray") {
    throw new TokenParsingError(
      "Failed to batch build array. No endArray token.",
      [endArray],
    );
  }
}

export async function buildString(queue: TokenQueue): Promise<string> {
  const stringTokens = await queue.takeUntil(t => t.name === "endString");
  if (
    stringTokens[0].name !== "startString" ||
    stringTokens[stringTokens.length - 1].name !== "endString"
  ) {
    throw new TokenParsingError("Failed to build string.", stringTokens);
  }

  const stringChunks = stringTokens.slice(1, -1);
  const string = [];
  for (const chunk of stringChunks) {
    if (chunk.name !== "stringChunk") {
      throw new TokenParsingError(
        "Failed to build string. Bad chunks.",
        stringChunks,
      );
    }

    string.push(chunk.value);
  }

  if (string.length === 0) {
    throw new TokenParsingError("Failed to build string. No chunks.");
  }

  if ((await queue.peek())?.name === "stringValue") {
    console.warn(
      "Detected a stringValue token. Please set `packStrings: false` on the parser for better performance.",
    );
    await queue.take();
  }

  return string.join("");
}

export async function buildNumber(queue: TokenQueue): Promise<number> {
  const numberTokens = await queue.takeUntil(t => t.name === "endNumber");
  if (
    numberTokens[0].name !== "startNumber" ||
    numberTokens[numberTokens.length - 1].name !== "endNumber"
  ) {
    throw new TokenParsingError("Failed to build number.", numberTokens);
  }

  const numberChunks = numberTokens.slice(1, -1);
  const rawNumber = [];
  for (const chunk of numberChunks) {
    if (chunk.name !== "numberChunk") {
      throw new TokenParsingError("Failed to build number.", numberChunks);
    }
    rawNumber.push(chunk.value);
  }

  if (rawNumber.length === 0) {
    throw new TokenParsingError("Failed to build number. No chunks.");
  }

  if ((await queue.peek())?.name === "numberValue") {
    console.warn(
      "Detected a numberValue token. Please set `packNumbers: false` on the parser for better performance.",
    );
    await queue.take();
  }

  const stringNumber = rawNumber.join("");
  return Number(stringNumber);
}
