import { processNodes } from "../../src/processing/nodes";
import { createInMemorySQLiteDB } from "../_factories/db";
import { createSnapshot } from "../_factories/snapshot";

test("processNodes throws if node count doesn't match node data count", async () => {
  const db = await createInMemorySQLiteDB();
  const snapshot = createSnapshot({
    nodeCount: 14,
  });
  await db
    .insertInto("snapshots")
    .values({
      ...snapshot,
      meta: JSON.stringify(snapshot.meta),
    })
    .execute();

  await expect(processNodes(db)).rejects.toThrow(
    /Size of node_data table .* doesn't match/,
  );
});

test("processNodes", async () => {
  const db = await createInMemorySQLiteDB();
  const snapshot = createSnapshot({
    nodeCount: 4,
  });
  await db
    .insertInto("snapshots")
    .values({
      ...snapshot,
      meta: JSON.stringify(snapshot.meta),
    })
    .execute();

  await db
    .insertInto("nodeData")
    .values([
      {
        index: 0,
        fieldValues: JSON.stringify([1, 1, 1, 0, 65, 0, 0]),
      },
      {
        index: 7,
        fieldValues: JSON.stringify([3, 2, 3, 0, 27, 0, 0]),
      },
      {
        index: 14,
        fieldValues: JSON.stringify([5, 3, 5, 0, 9432, 0, 0]),
      },
      {
        index: 21,
        fieldValues: JSON.stringify([2, 4, 7, 24, 86, 0, 0]),
      },
    ])
    .execute();
  await db
    .insertInto("strings")
    .values([
      { index: 1, value: "foo" },
      { index: 2, value: "bar" },
      { index: 3, value: "baz" },
      { index: 4, value: "bbq" },
    ])
    .execute();

  await processNodes(db);

  const nodes = await db
    .selectFrom("nodes")
    .selectAll()
    .orderBy("index asc")
    .execute();

  expect(nodes[0]).toEqual({
    id: 1,
    index: 0,
    type: "array",
    name: "foo",
    nodeId: 1,
    selfSize: 0,
    edgeCount: 65,
    traceNodeId: 0,
    detached: 0,
  });
  expect(nodes[1]).toEqual({
    id: 2,
    index: 7,
    type: "object",
    name: "bar",
    nodeId: 3,
    selfSize: 0,
    edgeCount: 27,
    traceNodeId: 0,
    detached: 0,
  });
  expect(nodes[2]).toEqual({
    id: 3,
    index: 14,
    type: "closure",
    name: "baz",
    nodeId: 5,
    selfSize: 0,
    edgeCount: 9432,
    traceNodeId: 0,
    detached: 0,
  });
  expect(nodes[3]).toEqual({
    id: 4,
    index: 21,
    type: "string",
    name: "bbq",
    nodeId: 7,
    selfSize: 24,
    edgeCount: 86,
    traceNodeId: 0,
    detached: 0,
  });
});
