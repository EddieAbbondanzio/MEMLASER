import { z } from "zod";

export const nodeJSONSchema = z.array(z.number());
export type NodeJSON = z.infer<typeof nodeJSONSchema>;

export const edgeJSONSchema = z.array(z.number());
export type EdgeJSON = z.infer<typeof edgeJSONSchema>;

export const stringsJSONSchema = z.array(z.string());
export type StringsJSON = z.infer<typeof stringsJSONSchema>;

export const traceFunctionInfosJSONSchema = z.array(z.number());
export type TraceFunctionInfosJSON = z.infer<
  typeof traceFunctionInfosJSONSchema
>;

export const traceTreesJSONSchema = z.array(z.number());
export type TraceTreesJSON = z.infer<typeof traceTreesJSONSchema>;

export const locationsJSONSchema = z.array(z.number());
export type LocationsJSON = z.infer<typeof locationsJSONSchema>;

export const samplesJSONSchema = z.array(z.number());
export type SamplesJSON = z.infer<typeof samplesJSONSchema>;

export const heapSnapshotJSONKeySchema = z.enum([
  "snapshot",
  "nodes",
  "edges",
  "trace_function_infos",
  "trace_tree",
  "samples",
  "locations",
  "strings",
]);
export type HeapSnapshotJSONKey = z.infer<typeof heapSnapshotJSONKeySchema>;

export const nodeFieldJSONSchema = z.enum([
  "type",
  "name",
  "id",
  "self_size",
  "edge_count",
  "detachedness",
  "trace_node_id",
]);
export type NodeFieldJSON = z.infer<typeof nodeFieldJSONSchema>;

export const nodeTypeJSONSchema = z.enum([
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
]);
export type NodeType = z.infer<typeof nodeTypeJSONSchema>;

export const edgeFieldJSONSchema = z.enum(["type", "name_or_index", "to_node"]);
export type EdgeFieldJSON = z.infer<typeof edgeFieldJSONSchema>;

export const edgeTypeJSONSchema = z.enum([
  "context",
  "element",
  "property",
  "internal",
  "hidden",
  "shortcut",
  "weak",
]);
export type EdgeType = z.infer<typeof edgeTypeJSONSchema>;

export const metaJSONSchema = z.object({
  node_fields: z.array(nodeFieldJSONSchema),
  node_types: z.tuple([z.array(nodeTypeJSONSchema)]).rest(z.string()),
  edge_fields: z.array(z.string()),
  edge_types: z.tuple([z.array(z.string())]).rest(z.string()),
  // TODO: What are the following?
  trace_function_info_fields: z.array(z.string()),
  trace_node_fields: z.array(z.string()),
  sample_fields: z.array(z.string()),
  location_fields: z.array(z.string()),
});
export type MetaJSON = z.infer<typeof metaJSONSchema>;

export const snapshotJSONSchema = z.object({
  meta: metaJSONSchema,
  // Number of actual nodes, and not the size of nodes array
  node_count: z.number(),
  // Number of actual edges, and not the size of edges array
  edge_count: z.number(),
  trace_function_count: z.number(),
});
export type SnapshotJSON = z.infer<typeof snapshotJSONSchema>;
