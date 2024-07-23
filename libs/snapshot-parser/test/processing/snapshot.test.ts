import { EdgeField, NodeField, Snapshot } from "@memlaser/database";
import {
  buildEdgeFieldIndices,
  buildNodeFieldIndices,
  getSnapshot,
} from "../../src/processing/snapshot.js";
import { createTestSQLiteDB } from "../_factories/db.js";
import { createMeta, createSnapshot } from "../_factories/snapshot.js";
import { test } from "node:test";
import assert from "node:assert";

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
  assert.strictEqual(snapshot.nodeCount, 7);
  assert.strictEqual(snapshot.edgeCount, 0);
  assert.strictEqual(snapshot.traceFunctionCount, 0);
  assert.deepEqual(snapshot.meta.edgeFields, [EdgeField.NameOrIndex]);
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
  assert.strictEqual(lookup.type, 0);
  assert.strictEqual(lookup.name, 1);
  assert.strictEqual(lookup.id, 2);
  assert.strictEqual(lookup.self_size, 3);
  assert.strictEqual(lookup.edge_count, 4);
  assert.strictEqual(lookup.trace_node_id, 5);
  assert.strictEqual(lookup.detachedness, 6);
});

test("buildEdgeFieldIndices", () => {
  const snapshot = createSnapshot({
    meta: createMeta({
      edgeFields: [EdgeField.Type, EdgeField.NameOrIndex, EdgeField.ToNode],
    }),
  });

  const lookup = buildEdgeFieldIndices(snapshot);
  assert.strictEqual(lookup.type, 0);
  assert.strictEqual(lookup.name_or_index, 1);
  assert.strictEqual(lookup.to_node, 2);
});
