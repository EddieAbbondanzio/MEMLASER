import {
  buildEdgeFieldIndices,
  buildNodeFieldIndices,
  getSnapshot,
} from "../../src/processing/snapshot";
import { createInMemorySQLiteDB } from "../_factories/db";
import { createMeta, createSnapshot } from "../_factories/snapshot";

test("getSnapshot", async () => {
  const db = await createInMemorySQLiteDB();
  await db
    .insertInto("snapshots")
    .values({
      nodeCount: 7,
      edgeCount: 0,
      meta: JSON.stringify(createMeta({ edge_fields: ["fake"] })),
      traceFunctionCount: 0,
    })
    .execute();

  const snapshot = await getSnapshot(db);
  expect(snapshot.nodeCount).toBe(7);
  expect(snapshot.edgeCount).toBe(0);
  expect(snapshot.traceFunctionCount).toBe(0);
  expect(snapshot.meta.edge_fields).toEqual(["fake"]);
});

test("buildNodeFieldIndices", () => {
  const snapshot = createSnapshot({
    meta: createMeta({
      node_fields: [
        "type",
        "name",
        "id",
        "self_size",
        "edge_count",
        "trace_node_id",
        "detachedness",
      ],
    }),
  });

  const lookup = buildNodeFieldIndices(snapshot);
  expect(lookup.type).toBe(0);
  expect(lookup.name).toBe(1);
  expect(lookup.id).toBe(2);
  expect(lookup.self_size).toBe(3);
  expect(lookup.edge_count).toBe(4);
  expect(lookup.trace_node_id).toBe(5);
  expect(lookup.detachedness).toBe(6);
});

test("buildEdgeFieldIndices", () => {
  const snapshot = createSnapshot({
    meta: createMeta({
      edge_fields: ["type", "name_or_index", "to_node"],
    }),
  });

  const lookup = buildEdgeFieldIndices(snapshot);
  expect(lookup.type).toBe(0);
  expect(lookup.name_or_index).toBe(1);
  expect(lookup.to_node).toBe(2);
});
