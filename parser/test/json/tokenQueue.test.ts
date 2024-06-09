import { createTokenQueue } from "../_factories/tokenQueue";

test("tokenQueue peek leaves token in queue", async () => {
  const tokenQueue = await createTokenQueue(
    [{ name: "startArray" }, { name: "endArray" }],
    {
      isDraining: false,
    },
  );

  expect(await tokenQueue.peek()).toEqual({ name: "startArray" });
  expect(await tokenQueue.peek()).toEqual({ name: "startArray" });
});

test("tokenQueue peek waits if not draining", async () => {
  const tokenQueue = await createTokenQueue([], {
    isDraining: false,
  });

  const peekPromise = tokenQueue.peek();
  tokenQueue.onToken({ name: "startObject" });
  expect(await peekPromise).toEqual({ name: "startObject" });
});

test("tokenQueue peek returns null if draining and cache is empty", async () => {
  const tokenQueue = await createTokenQueue([], {
    isDraining: true,
  });

  expect(await tokenQueue.peek()).toBe(null);
});

test("tokenQueue take removes token from queue", async () => {
  const tokenQueue = await createTokenQueue(
    [{ name: "startArray" }, { name: "endArray" }],
    {
      isDraining: false,
    },
  );

  expect(await tokenQueue.take()).toEqual({ name: "startArray" });
  expect(await tokenQueue.take()).toEqual({ name: "endArray" });
});

test("tokenQueue take waits if not draining", async () => {
  const tokenQueue = await createTokenQueue([], {
    isDraining: false,
  });

  const takePromise = tokenQueue.take();
  tokenQueue.onToken({ name: "startObject" });
  expect(await takePromise).toEqual({ name: "startObject" });
});

test("tokenQueue take returns null if draining and cache is empty", async () => {
  const tokenQueue = await createTokenQueue([], {
    isDraining: true,
  });

  expect(await tokenQueue.take()).toBe(null);
});
