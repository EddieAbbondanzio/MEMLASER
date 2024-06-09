import * as path from "path";
import {
  buildEdgeFieldValues,
  buildNodeFieldValues,
  buildSnapshot,
} from "../../src/json/parser";
import { createSnapshotJSON } from "../_factories/json";
import { createTokenQueue } from "../_factories/tokenQueue";

// This also tests buildMeta
test("buildSnapshot", async () => {
  const queue = await createTokenQueue(
    path.join(__dirname, "../_fixtures/snapshot.json"),
  );

  const snapshot = await buildSnapshot(queue);
  expect(snapshot.node_count).toBe(140112);
  expect(snapshot.edge_count).toBe(508875);
  expect(snapshot.trace_function_count).toBe(0);

  const { meta } = snapshot;
  expect(meta.node_fields).toEqual([
    "type",
    "name",
    "id",
    "self_size",
    "edge_count",
    "trace_node_id",
    "detachedness",
  ]);
  expect(meta.node_types).toEqual([
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
  expect(meta.edge_fields).toEqual(["type", "name_or_index", "to_node"]);
  expect(meta.edge_types).toEqual([
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
  expect(meta.trace_function_info_fields).toEqual([
    "function_id",
    "name",
    "script_name",
    "script_id",
    "line",
    "column",
  ]);
  expect(meta.trace_node_fields).toEqual([
    "id",
    "function_info_index",
    "count",
    "size",
    "children",
  ]);
  expect(meta.sample_fields).toEqual(["timestamp_us", "last_assigned_id"]);
  expect(meta.location_fields).toEqual([
    "object_index",
    "script_id",
    "line",
    "column",
  ]);
});

test("buildNodeFieldValues", async () => {
  const queue = await createTokenQueue(
    path.join(__dirname, "../_fixtures/nodes.json"),
  );
  const snapshot = createSnapshotJSON({
    node_count: 35,
  });

  const batches = [];
  for await (const batch of buildNodeFieldValues(queue, snapshot, 2)) {
    batches.push(batch);
  }

  const [batch1, batch2, batch3] = batches;
  expect(batch1).toEqual([
    [
      [0, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
    ],
    0,
  ]);
  expect(batch2).toEqual([
    [
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
    ],
    14,
  ]);
  expect(batch3).toEqual([[[28, 29, 30, 31, 32, 33, 34]], 28]);
});

test("buildEdgeFieldValues", async () => {
  const queue = await createTokenQueue(
    path.join(__dirname, "../_fixtures/edges.json"),
  );
  const snapshot = createSnapshotJSON({
    edge_count: 15,
  });

  const batches = [];
  for await (const batch of buildEdgeFieldValues(queue, snapshot, 2)) {
    batches.push(batch);
  }

  const [batch1, batch2, batch3] = batches;
  expect(batch1).toEqual([
    [
      [1, 1, 7],
      [2, 2, 14],
    ],
    0,
  ]);
  expect(batch2).toEqual([
    [
      [3, 3, 21],
      [4, 4, 28],
    ],
    6,
  ]);
  expect(batch3).toEqual([[[5, 5, 35]], 12]);
});
