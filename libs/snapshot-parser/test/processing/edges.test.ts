import {
  Snapshot,
  Node,
  HeapString,
  EdgeData,
  Edge,
  NodeType,
} from "@memlaser/database";
import {
  createEdgeDataLoader,
  processEdges,
} from "../../src/processing/edges.js";
import { createTestSQLiteDB } from "../_factories/db.js";
import { createSnapshot } from "../_factories/snapshot.js";
import { test } from "node:test";
import assert from "node:assert";

test("createEdgeDataLoader throws if cannot get next n edges", async () => {
  const db = await createTestSQLiteDB();
  const snapshot = createSnapshot();
  await db
    .createQueryBuilder()
    .insert()
    .into(Snapshot)
    .values(snapshot)
    .execute();

  const loader = await createEdgeDataLoader(db);
  await assert.rejects(async () => {
    await loader.getNext(3),
      (err: Error) => {
        assert.match(err.message, /Cannot get next 3 edges/);
      };
  });
});

test("createEdgeDataLoader", async () => {
  const db = await createTestSQLiteDB();
  const snapshot = createSnapshot({
    nodeCount: 5,
    edgeCount: 6,
  });
  await db
    .createQueryBuilder()
    .insert()
    .into(Snapshot)
    .values(snapshot)
    .execute();

  // Object should look like:
  // Foo: {
  //   a: ""
  //   b: ""
  //   c: ""
  //   d: ""
  // }
  await db
    .createQueryBuilder()
    .insert()
    .into(Node)
    .values([
      {
        type: NodeType.Object,
        name: "Foo",
        edgeCount: 4,
        index: 0,
        nodeId: 1,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: NodeType.String,
        name: "a",
        edgeCount: 0,
        index: 7,
        nodeId: 2,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: NodeType.String,
        name: "b",
        edgeCount: 0,
        index: 14,
        nodeId: 3,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: NodeType.String,
        name: "c",
        edgeCount: 0,
        index: 21,
        nodeId: 4,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: NodeType.String,
        name: "d",
        edgeCount: 0,
        index: 28,
        nodeId: 5,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
    ])
    .execute();
  await db
    .createQueryBuilder()
    .insert()
    .into(HeapString)
    .values([
      { index: 0, value: "a" },
      { index: 1, value: "b" },
      { index: 2, value: "c" },
      { index: 3, value: "d" },
    ])
    .execute();
  await db
    .createQueryBuilder()
    .insert()
    .into(EdgeData)
    .values([
      { index: 0, fieldValues: [2, 0, 7] },
      { index: 3, fieldValues: [2, 1, 14] },
      { index: 6, fieldValues: [2, 2, 21] },
      { index: 9, fieldValues: [2, 3, 28] },
    ])
    .execute();

  const loader = await createEdgeDataLoader(db, 2);
  const edges = await loader.getNext(4);
  assert.deepEqual(edges[0], {
    id: 1,
    index: 0,
    fieldValues: [2, 0, 7],
  });
  assert.deepEqual(edges[1], {
    id: 2,
    index: 3,
    fieldValues: [2, 1, 14],
  });
  assert.deepEqual(edges[2], {
    id: 3,
    index: 6,
    fieldValues: [2, 2, 21],
  });
  assert.deepEqual(edges[3], {
    id: 4,
    index: 9,
    fieldValues: [2, 3, 28],
  });
});

test("processEdges", async () => {
  const db = await createTestSQLiteDB();
  const snapshot = createSnapshot({
    nodeCount: 5,
    edgeCount: 6,
  });
  await db
    .createQueryBuilder()
    .insert()
    .into(Snapshot)
    .values(snapshot)
    .execute();

  // Object should look like:
  // Foo: {
  //   a: ""
  //   b: ""
  //   c: ""
  //   d: ""
  // }
  await db
    .createQueryBuilder()
    .insert()
    .into(Node)
    .values([
      {
        type: NodeType.Object,
        name: "Foo",
        edgeCount: 4,
        index: 0,
        nodeId: 1,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: NodeType.String,
        name: "a",
        edgeCount: 0,
        index: 7,
        nodeId: 2,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: NodeType.String,
        name: "b",
        edgeCount: 0,
        index: 14,
        nodeId: 3,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: NodeType.String,
        name: "c",
        edgeCount: 0,
        index: 21,
        nodeId: 4,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: NodeType.String,
        name: "d",
        edgeCount: 0,
        index: 28,
        nodeId: 5,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
    ])
    .execute();
  await db
    .createQueryBuilder()
    .insert()
    .into(HeapString)
    .values([
      { index: 0, value: "a" },
      { index: 1, value: "b" },
      { index: 2, value: "c" },
      { index: 3, value: "d" },
    ])
    .execute();
  await db
    .createQueryBuilder()
    .insert()
    .into(EdgeData)
    .values([
      { index: 0, fieldValues: [2, 0, 7] },
      { index: 3, fieldValues: [2, 1, 14] },
      { index: 6, fieldValues: [2, 2, 21] },
      { index: 9, fieldValues: [2, 3, 28] },
    ])
    .execute();

  await processEdges(db);

  const edges = await db.getRepository(Edge).find({
    order: {
      index: "ASC",
    },
  });

  assert.deepEqual(edges[0], {
    id: 1,
    index: 0,
    type: "property",
    name: "a",
    fromNodeId: 1,
    toNodeId: 2,
  });
  assert.deepEqual(edges[1], {
    id: 2,
    index: 3,
    type: "property",
    name: "b",
    fromNodeId: 1,
    toNodeId: 3,
  });
  assert.deepEqual(edges[2], {
    id: 3,
    index: 6,
    type: "property",
    name: "c",
    fromNodeId: 1,
    toNodeId: 4,
  });
  assert.deepEqual(edges[3], {
    id: 4,
    index: 9,
    type: "property",
    name: "d",
    fromNodeId: 1,
    toNodeId: 5,
  });
});
