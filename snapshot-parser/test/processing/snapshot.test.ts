import { EdgeField, NodeField, Snapshot } from "@memlaser/database";
import {
  buildEdgeFieldIndices,
  buildNodeFieldIndices,
  getSnapshot,
} from "../../src/processing/snapshot.js";
import { createTestSQLiteDB } from "../_factories/db.js";
import { createMeta, createSnapshot } from "../_factories/snapshot.js";

test("getSnapshot", async () => {
  const db = await createTestSQLiteDB();
  await db
    .createQueryBuilder()
    .insert()
    .into(Snapshot)
    .values({
      nodeCount: 7,
      edgeCount: 0,
      meta: createMeta({ edgeFields: [EdgeField.NameOrIndex] }),
      traceFunctionCount: 0,
    })
    .execute();

  const snapshot = await getSnapshot(db);
  expect(snapshot.nodeCount).toBe(7);
  expect(snapshot.edgeCount).toBe(0);
  expect(snapshot.traceFunctionCount).toBe(0);
  expect(snapshot.meta.edgeFields).toEqual([EdgeField.NameOrIndex]);
});

test("buildNodeFieldIndices", () => {
  const snapshot = createSnapshot({
    meta: createMeta({
      nodeFields: [
        NodeField.Type,
        NodeField.Name,
        NodeField.Id,
        NodeField.SelfSize,
        NodeField.EdgeCount,
        NodeField.TraceNodeId,
        NodeField.Detachedness,
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
      edgeFields: [EdgeField.Type, EdgeField.NameOrIndex, EdgeField.ToNode],
    }),
  });

  const lookup = buildEdgeFieldIndices(snapshot);
  expect(lookup.type).toBe(0);
  expect(lookup.name_or_index).toBe(1);
  expect(lookup.to_node).toBe(2);
});
