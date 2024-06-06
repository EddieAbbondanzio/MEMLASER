export interface HeapSnapshot {
  snapshot: Snapshot;
  nodes: number[];
  // N.B. Edges will always be a repeating pattern of [number, string | number,
  // number, ...] but that's hard to type so we type it as [number | string,
  // number | string, ...]
  edges: (number | string)[];
  trace_function_infos: unknown[];
  trace_tree: unknown[];
  samples: unknown[];
  locations: number[];
  strings: string[];
}

export interface Snapshot {
  meta: Meta;
  node_count: number;
  edge_count: number;
  trace_function_count: number;
}

export interface Meta {
  node_fields: NodeFields;
  node_types: NodeTypes;
  edge_fields: EdgeFields;
  edge_types: EdgeTypes;
}

export interface Node {
  type: NodeObjectType;
  name: string;
  id: number;
  selfSize: number;
  edgeCount: number;
  traceNodeId: number;
  detached: boolean;
  nodeIndex: number;
}

// These may change in the future, so we check the actual values when parsing.
export const NUM_OF_NODE_FIELDS = 7;

export const NODE_FIELDS = [
  "type",
  "name",
  "id",
  "self_size",
  "edge_count",
  "trace_node_id",
  "detachedness",
] as const;
export type NodeFields = typeof NODE_FIELDS;

export const NODE_TYPES = [
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
] as const;
export type NodeTypes = typeof NODE_TYPES;
export type NodeObjectType = keyof NodeTypes[0];

// These may change in the future, so we check the actual values when parsing.
export const NUM_OF_EDGE_FIELDS = 3;

export const EDGE_FIELDS = ["type", "name_or_index", "to_node"];
export type EdgeFields = typeof EDGE_FIELDS;

export const EDGE_TYPES = [
  ["context", "element", "property", "internal", "hidden", "shortcut", "weak"],
  "string_or_number",
  "node",
] as const;
export type EdgeTypes = typeof EDGE_TYPES;
export type EdgeObjectType = keyof EdgeTypes[0];

export interface Edge {
  type: EdgeObjectType;
  name: string;
  toNode: number;
}
