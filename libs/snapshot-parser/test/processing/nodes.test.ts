import { Snapshot, NodeData, HeapString, Node } from "@memlaser/database";
import { processNodes } from "../../src/processing/nodes.js";
import { createTestSQLiteDB } from "../_factories/db.js";
import { createSnapshot } from "../_factories/snapshot.js";
import { test } from "node:test";
import assert from "node:assert";

test("processNodes throws if node count doesn't match node data count", async () => {
  const db = await createTestSQLiteDB();
  const snapshot = createSnapshot({
    nodeCount: 14,
  });
  await db
    .createQueryBuilder()
    .insert()
    .into(Snapshot)
    .values(snapshot)
    .execute();

  await assert.rejects(async () => processNodes(db)),
    (err: Error) => {
      assert.match(err.message, /Size of node_data table .* doesn't match/);
    };
});

test("processNodes", async () => {
  const db = await createTestSQLiteDB();
  const snapshot = createSnapshot({
    nodeCount: 4,
  });
  await db
    .createQueryBuilder()
    .insert()
    .into(Snapshot)
    .values(snapshot)
    .execute();

  await db
    .createQueryBuilder()
    .insert()
    .into(NodeData)
    .values([
      {
        index: 0,
        fieldValues: [1, 1, 1, 0, 65, 0, 0],
      },
      {
        index: 7,
        fieldValues: [3, 2, 3, 0, 27, 0, 0],
      },
      {
        index: 14,
        fieldValues: [5, 3, 5, 0, 9432, 0, 0],
      },
      {
        index: 21,
        fieldValues: [2, 4, 7, 24, 86, 0, 0],
      },
    ])
    .execute();
  await db
    .createQueryBuilder()
    .insert()
    .into(HeapString)
    .values([
      { index: 1, value: "foo" },
      { index: 2, value: "bar" },
      { index: 3, value: "baz" },
      { index: 4, value: "bbq" },
    ])
    .execute();

  await processNodes(db);

  const nodes = await db.getRepository(Node).find({ order: { index: "ASC" } });

  assert.deepEqual(nodes[0], {
    id: 1,
    index: 0,
    type: "array",
    name: "foo",
    nodeId: 1,
    shallowSize: 0,
    retainedSize: null,
    edgeCount: 65,
    traceNodeId: 0,
    detached: 0,
    depth: null,
    root: null,
  });
  assert.deepEqual(nodes[1], {
    id: 2,
    index: 7,
    type: "object",
    name: "bar",
    nodeId: 3,
    shallowSize: 0,
    retainedSize: null,
    edgeCount: 27,
    traceNodeId: 0,
    detached: 0,
    depth: null,
    root: null,
  });
  assert.deepEqual(nodes[2], {
    id: 3,
    index: 14,
    type: "closure",
    name: "baz",
    nodeId: 5,
    shallowSize: 0,
    retainedSize: null,
    edgeCount: 9432,
    traceNodeId: 0,
    detached: 0,
    depth: null,
    root: null,
  });
  assert.deepEqual(nodes[3], {
    id: 4,
    index: 21,
    type: "string",
    name: "bbq",
    nodeId: 7,
    shallowSize: 24,
    retainedSize: 24,
    edgeCount: 86,
    traceNodeId: 0,
    detached: 0,
    depth: null,
    root: null,
  });
});
