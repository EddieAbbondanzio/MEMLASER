import { buildNodeFieldIndices } from "../../src/processing/snapshot";
import { Snapshot } from "../../src/processing/snapshot";

test("buildNodeFieldLookup", () => {
  const snapshot = {
    meta: {
      node_fields: [
        "type",
        "name",
        "id",
        "self_size",
        "edge_count",
        "trace_node_id",
        "detachedness",
      ],
    },
  } as unknown as Snapshot;

  const lookup = buildNodeFieldIndices(snapshot);
  expect(lookup.type).toBe(0);
  expect(lookup.name).toBe(1);
  expect(lookup.id).toBe(2);
  expect(lookup.self_size).toBe(3);
  expect(lookup.edge_count).toBe(4);
  expect(lookup.trace_node_id).toBe(5);
  expect(lookup.detachedness).toBe(6);
});
