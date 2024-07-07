import { createEdgeDataLoader, processEdges } from "../../src/processing/edges";
import { Edge } from "../../src/sqlite/entities/edge";
import { EdgeData } from "../../src/sqlite/entities/edgeData";
import { HeapString } from "../../src/sqlite/entities/heapString";
import { Node } from "../../src/sqlite/entities/node";
import { Snapshot } from "../../src/sqlite/entities/snapshot";
import { createTestSQLiteDB } from "../_factories/db";
import { createSnapshot } from "../_factories/snapshot";

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
  expect(loader.getNext(3)).rejects.toThrow(/Cannot get next 3 edges/);
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
        type: "object",
        name: "Foo",
        edgeCount: 4,
        index: 0,
        nodeId: 1,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: "string",
        name: "a",
        edgeCount: 0,
        index: 7,
        nodeId: 2,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: "string",
        name: "b",
        edgeCount: 0,
        index: 14,
        nodeId: 3,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: "string",
        name: "c",
        edgeCount: 0,
        index: 21,
        nodeId: 4,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: "string",
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
  expect(edges[0]).toEqual({
    id: 1,
    index: 0,
    fieldValues: [2, 0, 7],
  });
  expect(edges[1]).toEqual({
    id: 2,
    index: 3,
    fieldValues: [2, 1, 14],
  });
  expect(edges[2]).toEqual({
    id: 3,
    index: 6,
    fieldValues: [2, 2, 21],
  });
  expect(edges[3]).toEqual({
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
        type: "object",
        name: "Foo",
        edgeCount: 4,
        index: 0,
        nodeId: 1,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: "string",
        name: "a",
        edgeCount: 0,
        index: 7,
        nodeId: 2,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: "string",
        name: "b",
        edgeCount: 0,
        index: 14,
        nodeId: 3,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: "string",
        name: "c",
        edgeCount: 0,
        index: 21,
        nodeId: 4,
        selfSize: 0,
        traceNodeId: 0,
        detached: false,
      },
      {
        type: "string",
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

  expect(edges[0]).toEqual({
    id: 1,
    index: 0,
    type: "property",
    name: "a",
    fromNodeId: 1,
    toNodeId: 2,
  });
  expect(edges[1]).toEqual({
    id: 2,
    index: 3,
    type: "property",
    name: "b",
    fromNodeId: 1,
    toNodeId: 3,
  });
  expect(edges[2]).toEqual({
    id: 3,
    index: 6,
    type: "property",
    name: "c",
    fromNodeId: 1,
    toNodeId: 4,
  });
  expect(edges[3]).toEqual({
    id: 4,
    index: 9,
    type: "property",
    name: "d",
    fromNodeId: 1,
    toNodeId: 5,
  });
});
