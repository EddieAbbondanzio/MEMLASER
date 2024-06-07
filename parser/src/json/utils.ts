import { TokenParsingError } from "./errors";
import { TokenQueue } from "./tokenQueue";
import { Token } from "./tokens";

export async function buildKey<K extends string>(
  queue: TokenQueue,
): Promise<K> {
  const keyTokens = await queue.takeUntil(t => t.name === "endKey");
  if (
    keyTokens[0].name !== "startKey" &&
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

  return key.join("") as K;
}

export async function buildNumberArray(queue: TokenQueue): Promise<number[]> {
  const startArray = await queue.take();
  if (startArray === null || startArray.name !== "startArray") {
    throw new TokenParsingError("Failed to parse number array.", [startArray]);
  }

  const numbers = [];
  let nextToken: Token | null = null;
  do {
    const stringNumber = await buildNumber(queue);
    numbers.push(Number(stringNumber));
    nextToken = await queue.peek();
  } while (nextToken !== null && nextToken.name !== "endArray");

  // Remove endArray token from queue.
  await queue.take();

  return numbers;
}

export async function* batchBuildNumberArray(
  queue: TokenQueue,
  batchSize: number = 1000,
): AsyncGenerator<number[], void, void> {
  let numbers = [];
  let nextToken: Token | null = null;
  do {
    const number = await buildNumber(queue);
    numbers.push(number);

    if (numbers.length >= batchSize) {
      yield numbers;
      numbers = [];
    }

    nextToken = await queue.peek();
  } while (nextToken !== null && nextToken.name !== "endArray");

  // Remove endArray token from queue.
  await queue.take();
}

export async function buildStringArray(queue: TokenQueue): Promise<string[]> {
  const startArray = await queue.take();
  if (startArray?.name !== "startArray") {
    throw new TokenParsingError(
      "Failed to build string array. Array didn't start with startArray token.",
      [startArray],
    );
  }

  const strings = [];
  let nextToken: Token | null = null;
  do {
    const string = await buildString(queue);
    strings.push(string);
    nextToken = await queue.peek();
  } while (nextToken !== null && nextToken.name !== "endArray");

  // Remove endArray token from queue.
  await queue.take();

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

  // Remove endArray token from queue.
  await queue.take();
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

    // Remove it.
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

    // Remove it.
    await queue.take();
  }

  const stringNumber = rawNumber.join("");
  return Number(stringNumber);
}
