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

  const keyChunks = keyTokens.slice(1, -1);
  const keyData = [];
  for (const chunk of keyChunks) {
    if (chunk.name !== "stringChunk") {
      throw new TokenParsingError(
        "Failed to build key, got bad string chunk.",
        keyChunks,
      );
    }

    keyData.push(chunk.value);
  }

  if (keyChunks.length === 0) {
    throw new TokenParsingError("Failed to build key. No chunks.");
  }
  if ((await queue.peek())?.name === "keyValue") {
    console.warn(
      `Detected a keyValue token. Please set \`packKeys: false\` on the parser for better performance.`,
    );
    await queue.take();
  }

  return keyData.join("") as K;
}

export async function buildArray<I>(
  queue: TokenQueue,
  itemBuilder: (queue: TokenQueue) => Promise<I>,
): Promise<I[]> {
  await assertNextToken(queue, "startArray", "Failed to build array.");

  const items = [];
  let nextToken: Token | null = null;
  do {
    const item = await itemBuilder(queue);
    items.push(item);

    nextToken = await queue.peek();
  } while (nextToken !== null && nextToken.name !== "endArray");

  await assertNextToken(queue, "endArray", "Failed to build array.");
  return items;
}

export async function* batchBuildArray<I>(
  queue: TokenQueue,
  itemBuilder: (queue: TokenQueue) => Promise<I>,
  batchSize: number = 1000,
): AsyncGenerator<I[], void, void> {
  await assertNextToken(queue, "startArray", "Failed to build array.");

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

  await assertNextToken(queue, "endArray", "Failed to build array.");
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
  const stringData = [];
  for (const chunk of stringChunks) {
    if (chunk.name !== "stringChunk") {
      throw new TokenParsingError(
        "Failed to build string. Bad chunks.",
        stringChunks,
      );
    }

    stringData.push(chunk.value);
  }

  if (stringData.length === 0) {
    throw new TokenParsingError("Failed to build string. No chunks.");
  }
  if ((await queue.peek())?.name === "stringValue") {
    console.warn(
      "Detected a stringValue token. Please set `packStrings: false` on the parser for better performance.",
    );
    await queue.take();
  }

  return stringData.join("");
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
  const numberData = [];
  for (const chunk of numberChunks) {
    if (chunk.name !== "numberChunk") {
      throw new TokenParsingError("Failed to build number.", numberChunks);
    }
    numberData.push(chunk.value);
  }

  if (numberData.length === 0) {
    throw new TokenParsingError("Failed to build number. No chunks.");
  }

  if ((await queue.peek())?.name === "numberValue") {
    console.warn(
      "Detected a numberValue token. Please set `packNumbers: false` on the parser for better performance.",
    );
    await queue.take();
  }

  const stringNumber = numberData.join("");
  return Number(stringNumber);
}

async function assertNextToken(
  queue: TokenQueue,
  name: Token["name"],
  message: string,
): Promise<void> {
  const nextToken = await queue.take();
  if (nextToken === null || nextToken.name !== name) {
    throw new TokenParsingError(`${message} No ${name} token.`, [nextToken]);
  }
}
