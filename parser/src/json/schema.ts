import { z } from "zod";

export const numberArray = z.array(z.number());
export const stringArray = z.array(z.string());

export type Nodes = z.infer<typeof numberArray>;
export type Edges = z.infer<typeof numberArray>;
export type Strings = z.infer<typeof stringArray>;

export const heapSnapshotKeySchema = z.enum([
  "snapshot",
  "nodes",
  "edges",
  "trace_function_infos",
  "trace_tree",
  "samples",
  "locations",
  "strings",
]);

export type HeapSnapshotKey = z.infer<typeof heapSnapshotKeySchema>;

export const metaSchema = z.object({
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

export type Meta = z.infer<typeof metaSchema>;

export const snapshotSchema = z.object({
  meta: metaSchema,
  node_count: z.number(),
  edge_count: z.number(),
  trace_function_count: z.number(),
});

export type Snapshot = z.infer<typeof snapshotSchema>;
