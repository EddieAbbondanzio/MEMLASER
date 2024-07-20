import { EdgeField, EdgeType, NodeField, NodeType } from "@memlaser/database";
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
      NodeField.Type,
      NodeField.Name,
      NodeField.Id,
      NodeField.SelfSize,
      NodeField.EdgeCount,
      NodeField.TraceNodeId,
      NodeField.Detachedness,
    ],
    edge_fields: p?.edge_fields ?? [
      EdgeField.Type,
      EdgeField.NameOrIndex,
      EdgeField.ToNode,
    ],
    node_types: p?.node_types ?? [
      [
        NodeType.Hidden,
        NodeType.Array,
        NodeType.String,
        NodeType.Object,
        NodeType.Code,
        NodeType.Closure,
        NodeType.Regexp,
        NodeType.Number,
        NodeType.Native,
        NodeType.Synthetic,
        NodeType.ConcatenatedString,
        NodeType.SlicedString,
        NodeType.Symbol,
        NodeType.BigInt,
        NodeType.ObjectShape,
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
        EdgeType.Context,
        EdgeType.Element,
        EdgeType.Property,
        EdgeType.Internal,
        EdgeType.Hidden,
        EdgeType.Shortcut,
        EdgeType.Weak,
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
