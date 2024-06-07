import { buildNumber } from "../../src/json/utils";
import { createTokenQueue } from "../_factories/tokenQueue";

beforeEach(() => {
  jest.spyOn(console, "warn");
});

afterEach(() => {
  jest.resetAllMocks();
});

test("buildNumber missing startNumber", async () => {
  const queue = createTokenQueue(
    [{ name: "numberValue", value: "123" }, { name: "endNumber" }],
    { isDraining: true },
  );

  await expect(async () => {
    await buildNumber(queue);
  }).rejects.toThrow(/Failed to build number/);
});

test("buildNumber missing endNumber", async () => {
  const queue = createTokenQueue(
    [{ name: "startNumber" }, { name: "numberValue", value: "123" }],
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
