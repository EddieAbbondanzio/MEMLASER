import {
  EdgeField,
  EdgeType,
  LocationField,
  Meta,
  NodeField,
  NodeType,
  SampleField,
  Snapshot,
  TraceFunctionInfoField,
  TraceNodeField,
} from "@memlaser/database";

export function createSnapshot(props?: Partial<Snapshot>): Snapshot {
  return {
    id: props?.id ?? 1,
    nodeCount: props?.nodeCount ?? 7,
    edgeCount: props?.edgeCount ?? 0,
    traceFunctionCount: props?.traceFunctionCount ?? 0,
    meta: props?.meta ?? createMeta(),
  };
}

export function createMeta(props?: Partial<Meta>): Meta {
  return {
    nodeFields: props?.nodeFields ?? [
      NodeField.Type,
      NodeField.Name,
      NodeField.Id,
      NodeField.SelfSize,
      NodeField.EdgeCount,
      NodeField.TraceNodeId,
      NodeField.Detachedness,
    ],
    nodeTypes: props?.nodeTypes ?? [
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
    edgeFields: props?.edgeFields ?? [
      EdgeField.Type,
      EdgeField.NameOrIndex,
      EdgeField.ToNode,
    ],
    edgeTypes: props?.edgeTypes ?? [
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
    traceFunctionInfoFields: props?.traceFunctionInfoFields ?? [
      TraceFunctionInfoField.FunctionId,
      TraceFunctionInfoField.Name,
      TraceFunctionInfoField.ScriptName,
      TraceFunctionInfoField.ScriptId,
      TraceFunctionInfoField.Line,
      TraceFunctionInfoField.Column,
    ],
    traceNodeFields: props?.traceNodeFields ?? [
      TraceNodeField.Id,
      TraceNodeField.FunctionInfoIndex,
      TraceNodeField.Count,
      TraceNodeField.Size,
      TraceNodeField.Children,
    ],
    sampleFields: props?.sampleFields ?? [
      SampleField.TimestampUS,
      SampleField.LastAssignedId,
    ],
    locationFields: props?.locationFields ?? [
      LocationField.ObjectIndex,
      LocationField.ScriptId,
      LocationField.Line,
      LocationField.Column,
    ],
  };
}
