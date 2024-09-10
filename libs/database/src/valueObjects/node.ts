export enum NodeType {
  // TODO: What are hidden nodes?
  Hidden = "hidden",
  Array = "array",
  String = "string",
  Object = "object",
  Code = "code",
  Closure = "closure",
  Regexp = "regexp",
  Number = "number",
  Native = "native",
  // Synthetic objects are only included in the snapshot when HeapSnapshotOption
  // exposeInternals is set to true. These are internal Node objects and
  // unlikely to be related to the leak.
  Synthetic = "synthetic",
  ConcatenatedString = "concatenated string",
  SlicedString = "sliced string",
  Symbol = "symbol",
  BigInt = "bigint",
  ObjectShape = "object shape",
}

// Primitive types are objects that can't hold references to other objects. This
// doesn't included boxed classes (ie: String, Number) but permits types string
// or number.
const PRIMITIVE_NODE_TYPES = [
  NodeType.Number,
  NodeType.String,
  NodeType.BigInt,
];
export function isPrimitive(nodeType: NodeType): boolean {
  return PRIMITIVE_NODE_TYPES.includes(nodeType);
}

export enum NodeField {
  Type = "type",
  Name = "name",
  Id = "id",
  SelfSize = "self_size",
  EdgeCount = "edge_count",
  Detachedness = "detachedness",
  TraceNodeId = "trace_node_id",
}
