import { createTokenQueue } from "../_factories/tokenQueue.js";
import { test } from "node:test";
import assert from "node:assert";

test("tokenQueue peek leaves token in queue", async () => {
  const tokenQueue = await createTokenQueue(
    [{ name: "startArray" }, { name: "endArray" }],
    {
      isDraining: false,
    },
  );

  assert.deepEqual(await tokenQueue.peek(), { name: "startArray" });
  assert.deepEqual(await tokenQueue.peek(), { name: "startArray" });
});

test("tokenQueue peek waits if not draining", async () => {
  const tokenQueue = await createTokenQueue([], {
    isDraining: false,
  });

  const peekPromise = await tokenQueue.peek();
  tokenQueue.onToken({ name: "startObject" });
  assert.deepEqual(await peekPromise, { name: "startObject" });
});

test("tokenQueue peek returns null if draining and cache is empty", async () => {
  const tokenQueue = await createTokenQueue([], {
    isDraining: true,
  });

  const p = await tokenQueue.peek();
  assert.strictEqual(await tokenQueue.peek(), null);
});

test("tokenQueue take removes token from queue", async () => {
  const tokenQueue = await createTokenQueue(
    [{ name: "startArray" }, { name: "endArray" }],
    {
      isDraining: false,
    },
  );

  assert.deepEqual(await tokenQueue.take(), { name: "startArray" });
  assert.deepEqual(await tokenQueue.take(), { name: "endArray" });
});

test("tokenQueue take waits if not draining", async () => {
  const tokenQueue = await createTokenQueue([], {
    isDraining: false,
  });

  const takePromise = tokenQueue.take();
  tokenQueue.onToken({ name: "startObject" });
  assert.deepEqual(await takePromise, { name: "startObject" });
});

test("tokenQueue take returns null if draining and cache is empty", async () => {
  const tokenQueue = await createTokenQueue([], {
    isDraining: true,
  });

  assert.equal(await tokenQueue.take(), null);
});
