import {
  batchBuildArray,
  buildArray,
  buildKey,
  buildNumber,
  buildString,
} from "../../src/json/utils";
import { createTokenQueue } from "../_factories/tokenQueue";

beforeEach(() => {
  jest.spyOn(console, "warn");
});

afterEach(() => {
  jest.resetAllMocks();
});

test("buildKey missing startKey", async () => {
  const queue = createTokenQueue(
    [{ name: "stringChunk", value: "abc" }, { name: "endKey" }],
    { isDraining: true },
  );

  await expect(async () => {
    await buildKey(queue);
  }).rejects.toThrow(/Failed to build key/);
});

test("buildKey missing endKey", async () => {
  const queue = createTokenQueue(
    [{ name: "startKey" }, { name: "stringChunk", value: "abc" }],
    { isDraining: true },
  );

  await expect(async () => {
    await buildKey(queue);
  }).rejects.toThrow(/Failed to build key/);
});

test("buildKey invalid chunks", async () => {
  const queue = createTokenQueue(
    [
      { name: "startKey" },
      { name: "numberChunk", value: "123" },
      { name: "endKey" },
    ],
    { isDraining: true },
  );

  await expect(async () => {
    await buildKey(queue);
  }).rejects.toThrow(/Failed to build key/);
});

test("buildKey no chunks", async () => {
  const queue = createTokenQueue([{ name: "startKey" }, { name: "endKey" }], {
    isDraining: true,
  });

  await expect(async () => {
    await buildKey(queue);
  }).rejects.toThrow(/Failed to build key\. No chunks\./);
});

test("buildKey detected keyValue", async () => {
  const queue = createTokenQueue(
    [
      { name: "startKey" },
      { name: "stringChunk", value: "abc" },
      { name: "endKey" },
      { name: "keyValue", value: "abc" },
    ],
    {
      isDraining: true,
    },
  );

  const key = await buildKey(queue);
  expect(console.warn).toHaveBeenCalledWith(
    expect.stringMatching(/Detected a keyValue token/),
  );
  expect(key).toBe("abc");
});

test("buildKey", async () => {
  const queue = createTokenQueue(
    [
      { name: "startKey" },
      { name: "stringChunk", value: "abc" },
      { name: "stringChunk", value: "def" },
      { name: "endKey" },
    ],
    {
      isDraining: true,
    },
  );

  const key = await buildKey(queue);
  expect(key).toBe("abcdef");
});

test("buildArray missing startArray", async () => {
  const queue = createTokenQueue(
    [
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "endString" },
      { name: "endArray" },
    ],
    { isDraining: true },
  );

  await expect(async () => {
    await buildArray(queue, buildString);
  }).rejects.toThrow(/Failed to build array/);
});

test("buildArray missing endArray", async () => {
  const queue = createTokenQueue(
    [
      { name: "startArray" },
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "endString" },
    ],
    { isDraining: true },
  );

  await expect(async () => {
    await buildArray(queue, buildString);
  }).rejects.toThrow(/Failed to build array/);
});

test("buildArray empty array", async () => {
  const queue = createTokenQueue(
    [{ name: "startArray" }, { name: "endArray" }],
    { isDraining: true },
  );

  const arr = await buildArray(queue, buildString);
  expect(arr).toEqual([]);
});

test("buildArray", async () => {
  const queue = createTokenQueue(
    [
      { name: "startArray" },
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "endString" },
      { name: "startString" },
      { name: "stringChunk", value: "def" },
      { name: "endString" },
      { name: "endArray" },
    ],
    { isDraining: true },
  );

  const arr = await buildArray(queue, buildString);
  expect(arr).toEqual(["abc", "def"]);
});

test("batchBuildArray missing startArray", async () => {
  const queue = createTokenQueue(
    [
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "endString" },
      { name: "endArray" },
    ],
    { isDraining: true },
  );

  await expect(async () => {
    for await (let _ of batchBuildArray(queue, buildString)) {
    }
  }).rejects.toThrow(/Failed to batch build array/);
});

test("batchBuildArray missing endArray", async () => {
  const queue = createTokenQueue(
    [
      { name: "startArray" },
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "endString" },
    ],
    { isDraining: true },
  );

  await expect(async () => {
    for await (let _ of batchBuildArray(queue, buildString)) {
    }
  }).rejects.toThrow(/Failed to batch build array/);
});

test("buildArray empty array", async () => {
  const queue = createTokenQueue(
    [{ name: "startArray" }, { name: "endArray" }],
    { isDraining: true },
  );

  const arr = [];
  for await (let items of batchBuildArray(queue, buildString, 1)) {
    arr.push(...items);
  }
  expect(arr).toEqual([]);
});

test("batchBuildArray", async () => {
  const queue = createTokenQueue(
    [
      { name: "startArray" },
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "endString" },
      { name: "startString" },
      { name: "stringChunk", value: "def" },
      { name: "endString" },
      { name: "startString" },
      { name: "stringChunk", value: "ghi" },
      { name: "endString" },
      { name: "endArray" },
    ],
    { isDraining: true },
  );

  const arr = [];
  for await (let items of batchBuildArray(queue, buildString, 2)) {
    arr.push(...items);
  }

  expect(arr).toEqual(["abc", "def", "ghi"]);
});

test("buildString missing startString", async () => {
  const queue = createTokenQueue(
    [{ name: "stringChunk", value: "abc" }, { name: "endString" }],
    { isDraining: true },
  );

  await expect(async () => {
    await buildString(queue);
  }).rejects.toThrow(/Failed to build string/);
});

test("buildString missing endString", async () => {
  const queue = createTokenQueue(
    [{ name: "startString" }, { name: "stringChunk", value: "abc" }],
    { isDraining: true },
  );

  await expect(async () => {
    await buildString(queue);
  }).rejects.toThrow(/Failed to build string/);
});

test("buildString invalid chunks", async () => {
  const queue = createTokenQueue(
    [
      { name: "startString" },
      { name: "keyValue", value: "abc" },
      { name: "endString" },
    ],
    { isDraining: true },
  );

  await expect(async () => {
    await buildString(queue);
  }).rejects.toThrow(/Failed to build string/);
});

test("buildString no chunks (empty string)", async () => {
  const queue = createTokenQueue(
    [{ name: "startString" }, { name: "endString" }],
    { isDraining: true },
  );

  const str = await buildString(queue);
  expect(str).toBe("");
});

test("buildString detected stringValue", async () => {
  const queue = createTokenQueue(
    [
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "endString" },
      { name: "stringValue", value: "abc" },
    ],
    { isDraining: true },
  );

  const str = await buildString(queue);
  expect(console.warn).toHaveBeenCalledWith(
    expect.stringMatching(/Detected a stringValue token/),
  );
  expect(str).toBe("abc");
});

test("buildString", async () => {
  const queue = createTokenQueue(
    [
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "stringChunk", value: "def" },
      { name: "stringChunk", value: "ghi" },
      { name: "endString" },
    ],
    { isDraining: true },
  );

  const str = await buildString(queue);
  expect(str).toBe("abcdefghi");
});

test("buildNumber missing startNumber", async () => {
  const queue = createTokenQueue(
    [{ name: "numberChunk", value: "123" }, { name: "endNumber" }],
    { isDraining: true },
  );

  await expect(async () => {
    await buildNumber(queue);
  }).rejects.toThrow(/Failed to build number/);
});

test("buildNumber missing endNumber", async () => {
  const queue = createTokenQueue(
    [{ name: "startNumber" }, { name: "numberChunk", value: "123" }],
    { isDraining: true },
  );

  await expect(async () => {
    await buildNumber(queue);
  }).rejects.toThrow(/Failed to build number/);
});

test("buildNumber invalid chunks", async () => {
  const queue = createTokenQueue(
    [
      { name: "startNumber" },
      { name: "keyValue", value: "key" },
      { name: "endNumber" },
    ],
    { isDraining: true },
  );

  await expect(async () => {
    await buildNumber(queue);
  }).rejects.toThrow(/Failed to build number/);
});

test("buildNumber no chunks", async () => {
  const queue = createTokenQueue(
    [{ name: "startNumber" }, { name: "endNumber" }],
    { isDraining: true },
  );

  await expect(async () => {
    await buildNumber(queue);
  }).rejects.toThrow(/Failed to build number\. No chunks/);
});

test("buildNumber detected numberValue token", async () => {
  const queue = createTokenQueue(
    [
      { name: "startNumber" },
      { name: "numberChunk", value: "234" },
      { name: "endNumber" },
      { name: "numberValue", value: "234" },
    ],
    { isDraining: true },
  );

  const num = await buildNumber(queue);
  expect(console.warn).toHaveBeenCalledWith(
    expect.stringMatching(/Detected a numberValue token/),
  );
  expect(num).toBe(234);
});

test("buildNumber integer", async () => {
  const queue = createTokenQueue(
    [
      { name: "startNumber" },
      { name: "numberChunk", value: "100" },
      { name: "numberChunk", value: "200" },
      { name: "numberChunk", value: "300" },
      { name: "endNumber" },
    ],
    { isDraining: true },
  );

  const num = await buildNumber(queue);
  expect(num).toBe(100200300);
});

test("buildNumber float", async () => {
  const queue = createTokenQueue(
    [
      { name: "startNumber" },
      { name: "numberChunk", value: "3.14" },
      { name: "numberChunk", value: "1592" },
      { name: "endNumber" },
    ],
    { isDraining: true },
  );

  const num = await buildNumber(queue);
  expect(num).toBe(3.141592);
});
