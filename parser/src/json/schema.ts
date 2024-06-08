import { z } from "zod";

export const nodesJSONSchema = z.array(z.number());
export type NodesJSON = z.infer<typeof nodesJSONSchema>;

export const edgesJSONSchema = z.array(z.number());
export type EdgesJSON = z.infer<typeof edgesJSONSchema>;

export const stringsJSONSchema = z.array(z.string());
export type StringsJSON = z.infer<typeof stringsJSONSchema>;

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

export const metaJSONSchema = z.object({
  node_fields: z.array(z.string()),
  node_types: z.tuple([z.array(z.string())]).rest(z.string()),
  edge_fields: z.array(z.string()),
  edge_types: z.tuple([z.array(z.string())]).rest(z.string()),
  // TODO: What are these?
  trace_function_info_fields: z.array(z.string()),
  trace_node_fields: z.array(z.string()),
  sample_fields: z.array(z.string()),
  location_fields: z.array(z.string()),
});
export type MetaJSON = z.infer<typeof metaJSONSchema>;

export const snapshotJSONSchema = z.object({
  meta: metaJSONSchema,
  node_count: z.number(),
  edge_count: z.number(),
  trace_function_count: z.number(),
});
export type SnapshotJSON = z.infer<typeof snapshotJSONSchema>;
