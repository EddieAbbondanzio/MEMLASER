import { MetaJSON } from "../../src/json/schema";
import { Snapshot } from "../../src/processing/snapshot";

export function createSnapshot(props?: Partial<Snapshot>): Snapshot {
  return {
    id: props?.id ?? 1,
    nodeCount: props?.nodeCount ?? 7,
    edgeCount: props?.edgeCount ?? 0,
    traceFunctionCount: props?.traceFunctionCount ?? 0,
    meta: props?.meta ?? createMeta(),
  };
}

export function createMeta(props?: Partial<MetaJSON>): MetaJSON {
  return {
    node_fields: props?.node_fields ?? [
      "type",
      "name",
      "id",
      "self_size",
      "edge_count",
      "trace_node_id",
      "detachedness",
    ],
    node_types: props?.node_types ?? [
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
    edge_fields: props?.edge_fields ?? ["type", "name_or_index", "to_node"],
    edge_types: props?.edge_types ?? [
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
    trace_function_info_fields: props?.trace_function_info_fields ?? [
      "function_id",
      "name",
      "script_name",
      "script_id",
      "line",
      "column",
    ],
    trace_node_fields: props?.trace_node_fields ?? [
      "id",
      "function_info_index",
      "count",
      "size",
      "children",
    ],
    sample_fields: props?.sample_fields ?? ["timestamp_us", "last_assigned_id"],
    location_fields: props?.location_fields ?? [
      "object_index",
      "script_id",
      "line",
      "column",
    ],
  };
}
