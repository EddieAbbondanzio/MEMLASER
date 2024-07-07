import { MetaJSON, SnapshotJSON } from "../../src/json/schema.js";

export function createSnapshotJSON(p?: Partial<SnapshotJSON>): SnapshotJSON {
  return {
    node_count: p?.node_count ?? 0,
    edge_count: p?.edge_count ?? 0,
    trace_function_count: p?.trace_function_count ?? 0,
    meta: p?.meta ?? createMetaJSON(),
  };
}

export function createMetaJSON(p?: Partial<MetaJSON>): MetaJSON {
  return {
    node_fields: p?.node_fields ?? [
      "type",
      "name",
      "id",
      "self_size",
      "edge_count",
      "trace_node_id",
      "detachedness",
    ],
    edge_fields: p?.edge_fields ?? ["type", "name_or_index", "to_node"],
    node_types: p?.node_types ?? [
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
    ],
    edge_types: p?.edge_types ?? [
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
    ],
    location_fields: p?.location_fields ?? [],
    sample_fields: p?.sample_fields ?? [],
    trace_function_info_fields: p?.trace_function_info_fields ?? [],
    trace_node_fields: p?.trace_node_fields ?? [],
  };
}
