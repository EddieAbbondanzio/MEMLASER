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
  // TODO: What are these? The MS docs didn't mention them.
  trace_function_info_fields: string[];
  trace_node_fields: string[];
  sample_fields: string[];
  location_fields: string[];
}

export const NODE_FIELDS = [
  "type",
  "name",
  "id",
  "self_size",
  "edge_count",
  "trace_node_id",
  "detachedness",
];
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

export const EDGE_FIELDS = ["type", "name_or_index", "to_node"];
export type EdgeFields = typeof EDGE_FIELDS;

export const EDGE_TYPES = [
  ["context", "element", "property", "internal", "hidden", "shortcut", "weak"],
  "string_or_number",
  "node",
] as const;
export type EdgeTypes = typeof EDGE_TYPES;
export type EdgeObjectType = keyof EdgeTypes[0];
