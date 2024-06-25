import { createEdgeDataLoader } from "../../src/processing/edges";
import { createInMemorySQLiteDB } from "../_factories/db";
import { createSnapshot } from "../_factories/snapshot";

test("createEdgeDataLoader throws if cannot get next n edges", async () => {
  const db = await createInMemorySQLiteDB();
  const snapshot = createSnapshot();
  await db
    .insertInto("snapshots")
    .values({
      ...snapshot,
      meta: JSON.stringify(snapshot.meta),
    })
    .execute();

  const loader = await createEdgeDataLoader(db);
  expect(loader.getNext(3)).rejects.toThrow(/Cannot get next 3 edges/);
});

test("createEdgeDataLoader", async () => {
  const db = await createInMemorySQLiteDB();
  const snapshot = createSnapshot({
    nodeCount: 5,
    edgeCount: 6,
  });
  await db
    .insertInto("snapshots")
    .values({
      ...snapshot,
      meta: JSON.stringify(snapshot.meta),
    })
    .execute();

  // Object should look like:
  // Foo: {
  //   a: ""
  //   b: ""
  //   c: ""
  //   d: ""
  // }
  await db
    .insertInto("nodes")
    .values([
      {
        type: "object",
        name: "Foo",
        edgeCount: 4,
        index: 0,
        nodeId: 1,
        selfSize: 0,
        traceNodeId: 0,
        detached: 0,
      },
      {
        type: "string",
        name: "a",
        edgeCount: 0,
        index: 7,
        nodeId: 2,
        selfSize: 0,
        traceNodeId: 0,
        detached: 0,
      },
      {
        type: "string",
        name: "b",
        edgeCount: 0,
        index: 14,
        nodeId: 3,
        selfSize: 0,
        traceNodeId: 0,
        detached: 0,
      },
      {
        type: "string",
        name: "c",
        edgeCount: 0,
        index: 21,
        nodeId: 4,
        selfSize: 0,
        traceNodeId: 0,
        detached: 0,
      },
      {
        type: "string",
        name: "d",
        edgeCount: 0,
        index: 28,
        nodeId: 5,
        selfSize: 0,
        traceNodeId: 0,
        detached: 0,
      },
    ])
    .execute();
  await db
    .insertInto("strings")
    .values([
      { index: 0, value: "a" },
      { index: 1, value: "b" },
      { index: 2, value: "c" },
      { index: 3, value: "d" },
    ])
    .execute();
  await db
    .insertInto("edgeData")
    .values([
      { index: 0, fieldValues: JSON.stringify(["property", 0, 7]) },
      { index: 3, fieldValues: JSON.stringify(["property", 1, 14]) },
      { index: 6, fieldValues: JSON.stringify(["property", 2, 21]) },
      { index: 9, fieldValues: JSON.stringify(["property", 3, 28]) },
    ])
    .execute();

  const loader = await createEdgeDataLoader(db, 2);
  const edges = await loader.getNext(4);
  expect(edges[0]).toEqual({
    id: 1,
    index: 0,
    fieldValues: '["property",0,7]',
  });
  expect(edges[1]).toEqual({
    id: 2,
    index: 3,
    fieldValues: '["property",1,14]',
  });
  expect(edges[2]).toEqual({
    id: 3,
    index: 6,
    fieldValues: '["property",2,21]',
  });
  expect(edges[3]).toEqual({
    id: 4,
    index: 9,
    fieldValues: '["property",3,28]',
  });
});
