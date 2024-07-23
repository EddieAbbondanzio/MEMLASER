import * as path from "path";
import {
  buildEdgeFieldValues,
  buildNodeFieldValues,
  buildSnapshot,
} from "../../src/json/parser.js";
import { createSnapshotJSON } from "../_factories/json.js";
import { createTokenQueue } from "../_factories/tokenQueue.js";
import { test } from "node:test";
import assert from "node:assert";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// This also tests buildMeta
test("buildSnapshot", async () => {
  const queue = await createTokenQueue(
    path.join(dirname, "../_fixtures/snapshot.json"),
  );

  const snapshot = await buildSnapshot(queue);
  assert.strictEqual(snapshot.node_count, 140112);
  assert.strictEqual(snapshot.edge_count, 508875);
  assert.strictEqual(snapshot.trace_function_count, 0);

  const { meta } = snapshot;
  assert.deepEqual(meta.node_fields, [
    "type",
    "name",
    "id",
    "self_size",
    "edge_count",
    "trace_node_id",
    "detachedness",
  ]);
  assert.deepEqual(meta.node_types, [
    [
      "hidden",
      "array",
      "string",
      "object",
      "code",
      "closure",
      "regexp",
      "number",
      "native",
      "synthetic",
      "concatenated string",
      "sliced string",
      "symbol",
      "bigint",
      "object shape",
    ],
    "string",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]);
  assert.deepEqual(meta.edge_fields, ["type", "name_or_index", "to_node"]);
  assert.deepEqual(meta.edge_types, [
    [
      "context",
      "element",
      "property",
      "internal",
      "hidden",
      "shortcut",
      "weak",
    ],
    "string_or_number",
    "node",
  ]);
  assert.deepEqual(meta.trace_function_info_fields, [
    "function_id",
    "name",
    "script_name",
    "script_id",
    "line",
    "column",
  ]);
  assert.deepEqual(meta.trace_node_fields, [
    "id",
    "function_info_index",
    "count",
    "size",
    "children",
  ]);
  assert.deepEqual(meta.sample_fields, ["timestamp_us", "last_assigned_id"]);
  assert.deepEqual(meta.location_fields, [
    "object_index",
    "script_id",
    "line",
    "column",
  ]);
});

test("buildNodeFieldValues", async () => {
  const queue = await createTokenQueue(
    path.join(dirname, "../_fixtures/nodes.json"),
  );
  const snapshot = createSnapshotJSON({
    node_count: 35,
  });

  const batches = [];
  for await (const batch of buildNodeFieldValues(queue, snapshot, 2)) {
    batches.push(batch);
  }

  const [batch1, batch2, batch3] = batches;
  assert.deepEqual(batch1, [
    [
      [0, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
    ],
    0,
  ]);
  assert.deepEqual(batch2, [
    [
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
    ],
    14,
  ]);
  assert.deepEqual(batch3, [[[28, 29, 30, 31, 32, 33, 34]], 28]);
});

test("buildEdgeFieldValues", async () => {
  const queue = await createTokenQueue(
    path.join(dirname, "../_fixtures/edges.json"),
  );
  const snapshot = createSnapshotJSON({
    edge_count: 15,
  });

  const batches = [];
  for await (const batch of buildEdgeFieldValues(queue, snapshot, 2)) {
    batches.push(batch);
  }

  const [batch1, batch2, batch3] = batches;
  assert.deepEqual(batch1, [
    [
      [1, 1, 7],
      [2, 2, 14],
    ],
    0,
  ]);
  assert.deepEqual(batch2, [
    [
      [3, 3, 21],
      [4, 4, 28],
    ],
    6,
  ]);
  assert.deepEqual(batch3, [[[5, 5, 35]], 12]);
});
