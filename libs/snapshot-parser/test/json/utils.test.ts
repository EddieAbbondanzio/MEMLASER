import {
  batchBuildArray,
  buildArray,
  buildKey,
  buildNumber,
  buildObject,
  buildString,
} from "../../src/json/utils.js";
import { createTokenQueue } from "../_factories/tokenQueue.js";
import { test, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";

global.console.warn = mock.fn();

test("buildObject missing startObject", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startKey" },
      { name: "stringChunk", value: "foo" },
      { name: "endKey" },
      { name: "startNumber" },
      { name: "numberChunk", value: "1" },
      { name: "endNumber" },
      { name: "endObject" },
    ],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildObject(queue, buildNumber);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build object/);
      return true;
    },
  );
});

test("buildObject missing endObject", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startObject" },
      { name: "startKey" },
      { name: "stringChunk", value: "foo" },
      { name: "endKey" },
      { name: "startNumber" },
      { name: "numberChunk", value: "1" },
      { name: "endNumber" },
    ],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildObject(queue, buildNumber);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build object/);
      return true;
    },
  );
});

test("buildObject missing key", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startObject" },
      { name: "startNumber" },
      { name: "numberChunk", value: "1" },
      { name: "endNumber" },
      { name: "endObject" },
    ],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildObject(queue, buildNumber);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build key/);
      return true;
    },
  );
});

test("buildObject missing value", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startObject" },
      { name: "startKey" },
      { name: "stringChunk", value: "foo" },
      { name: "endKey" },
      { name: "endObject" },
    ],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildObject(queue, buildNumber);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build number/);
      return true;
    },
  );
});

test("buildObject", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startObject" },
      { name: "startKey" },
      { name: "stringChunk", value: "foo" },
      { name: "endKey" },
      { name: "startNumber" },
      { name: "numberChunk", value: "1" },
      { name: "endNumber" },
      { name: "startKey" },
      { name: "stringChunk", value: "bar" },
      { name: "endKey" },
      { name: "startNumber" },
      { name: "numberChunk", value: "2" },
      { name: "endNumber" },
      { name: "endObject" },
    ],
    { isDraining: true },
  );

  const obj = await buildObject(queue, buildNumber);
  assert.deepEqual(obj, {
    foo: 1,
    bar: 2,
  });
});

test("buildArray missing startArray", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "endString" },
      { name: "endArray" },
    ],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildArray(queue, buildString);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build array/);
      return true;
    },
  );
});

test("buildArray missing endArray", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startArray" },
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "endString" },
    ],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildArray(queue, buildString);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build array/);
      return true;
    },
  );
});

test("buildArray empty array", async () => {
  const queue = await createTokenQueue(
    [{ name: "startArray" }, { name: "endArray" }],
    { isDraining: true },
  );

  const arr = await buildArray(queue, buildString);
  assert.deepEqual(arr, []);
});

test("buildArray", async () => {
  const queue = await createTokenQueue(
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
  assert.deepEqual(arr, ["abc", "def"]);
});

test("batchBuildArray missing startArray", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "endString" },
      { name: "endArray" },
    ],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      // eslint-disable-next-line no-empty
      for await (const _ of batchBuildArray(queue, buildString)) {
      }
    },
    (e: Error) => {
      assert.match(e.message, /Failed to batch build array/);
      return true;
    },
  );
});

test("batchBuildArray missing endArray", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startArray" },
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "endString" },
    ],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      // eslint-disable-next-line no-empty
      for await (const _ of batchBuildArray(queue, buildString)) {
      }
    },
    (e: Error) => {
      assert.match(e.message, /Failed to batch build array/);
      return true;
    },
  );
});

test("buildArray empty array", async () => {
  const queue = await createTokenQueue(
    [{ name: "startArray" }, { name: "endArray" }],
    { isDraining: true },
  );

  const arr = [];
  for await (const items of batchBuildArray(queue, buildString, 1)) {
    arr.push(...items);
  }
  assert.deepEqual(arr, []);
});

test("batchBuildArray", async () => {
  const queue = await createTokenQueue(
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

  const batches = [];
  for await (const [items, offset] of batchBuildArray(queue, buildString, 2)) {
    batches.push([items, offset]);
  }

  assert.deepEqual(batches[0], [["abc", "def"], 0]);
  assert.deepEqual(batches[1], [["ghi"], 2]);
});

test("buildKey missing startKey", async () => {
  const queue = await createTokenQueue(
    [{ name: "stringChunk", value: "abc" }, { name: "endKey" }],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildKey(queue);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build key/);
      return true;
    },
  );
});

test("buildKey missing endKey", async () => {
  const queue = await createTokenQueue(
    [{ name: "startKey" }, { name: "stringChunk", value: "abc" }],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildKey(queue);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build key/);
      return true;
    },
  );
});

test("buildKey invalid chunks", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startKey" },
      { name: "numberChunk", value: "123" },
      { name: "endKey" },
    ],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildKey(queue);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build key/);
      return true;
    },
  );
});

test("buildKey no chunks", async () => {
  const queue = await createTokenQueue(
    [{ name: "startKey" }, { name: "endKey" }],
    {
      isDraining: true,
    },
  );

  await assert.rejects(
    async () => {
      await buildKey(queue);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build key\. No chunks\./);
      return true;
    },
  );
});

test("buildKey detected keyValue", async () => {
  const queue = await createTokenQueue(
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
  assert.deepEqual(key, "abc");
});

test("buildKey", async () => {
  const queue = await createTokenQueue(
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
  assert.deepEqual(key, "abcdef");
});

test("buildString missing startString", async () => {
  const queue = await createTokenQueue(
    [{ name: "stringChunk", value: "abc" }, { name: "endString" }],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildString(queue);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build string/);
      return true;
    },
  );
});

test("buildString missing endString", async () => {
  const queue = await createTokenQueue(
    [{ name: "startString" }, { name: "stringChunk", value: "abc" }],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildString(queue);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build string/);
      return true;
    },
  );
});

test("buildString invalid chunks", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startString" },
      { name: "keyValue", value: "abc" },
      { name: "endString" },
    ],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildString(queue);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build string/);
      return true;
    },
  );
});

test("buildString no chunks (empty string)", async () => {
  const queue = await createTokenQueue(
    [{ name: "startString" }, { name: "endString" }],
    { isDraining: true },
  );

  const str = await buildString(queue);
  assert.deepEqual(str, "");
});

test("buildString detected stringValue", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startString" },
      { name: "stringChunk", value: "abc" },
      { name: "endString" },
      { name: "stringValue", value: "abc" },
    ],
    { isDraining: true },
  );

  const str = await buildString(queue);
  assert.deepEqual(str, "abc");
});

test("buildString", async () => {
  const queue = await createTokenQueue(
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
  assert.deepEqual(str, "abcdefghi");
});

test("buildNumber missing startNumber", async () => {
  const queue = await createTokenQueue(
    [{ name: "numberChunk", value: "123" }, { name: "endNumber" }],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildNumber(queue);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build number/);
      return true;
    },
  );
});

test("buildNumber missing endNumber", async () => {
  const queue = await createTokenQueue(
    [{ name: "startNumber" }, { name: "numberChunk", value: "123" }],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildNumber(queue);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build number/);
      return true;
    },
  );
});

test("buildNumber invalid chunks", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startNumber" },
      { name: "keyValue", value: "key" },
      { name: "endNumber" },
    ],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildNumber(queue);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build number/);
      return true;
    },
  );
});

test("buildNumber no chunks", async () => {
  const queue = await createTokenQueue(
    [{ name: "startNumber" }, { name: "endNumber" }],
    { isDraining: true },
  );

  await assert.rejects(
    async () => {
      await buildNumber(queue);
    },
    (e: Error) => {
      assert.match(e.message, /Failed to build number\. No chunks/);
      return true;
    },
  );
});

test("buildNumber detected numberValue token", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startNumber" },
      { name: "numberChunk", value: "234" },
      { name: "endNumber" },
      { name: "numberValue", value: "234" },
    ],
    { isDraining: true },
  );

  const num = await buildNumber(queue);

  assert.strictEqual(num, 234);
});

test("buildNumber integer", async () => {
  const queue = await createTokenQueue(
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
  assert.strictEqual(num, 100200300);
});

test("buildNumber float", async () => {
  const queue = await createTokenQueue(
    [
      { name: "startNumber" },
      { name: "numberChunk", value: "3.14" },
      { name: "numberChunk", value: "1592" },
      { name: "endNumber" },
    ],
    { isDraining: true },
  );

  const num = await buildNumber(queue);
  assert.strictEqual(num, 3.141592);
});
