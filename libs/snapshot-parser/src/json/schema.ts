import {
  EdgeField,
  EdgeType,
  LocationField,
  NodeField,
  NodeType,
  SampleField,
  TraceFunctionInfoField,
  TraceNodeField,
} from "@memlaser/database";
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

export const nodeFieldSchema = z.nativeEnum(NodeField);
export const nodeTypeSchema = z.nativeEnum(NodeType);
export const edgeFieldSchema = z.nativeEnum(EdgeField);
export const edgeTypeSchema = z.nativeEnum(EdgeType);
export const traceFunctionInfoFieldsSchema = z.nativeEnum(
  TraceFunctionInfoField,
);
export const traceNodeFieldsSchema = z.nativeEnum(TraceNodeField);
export const sampleFieldsSchema = z.nativeEnum(SampleField);
export const locationFieldsSchema = z.nativeEnum(LocationField);

// Keep in sync with MetaJson type in database package.
export const metaJSONSchema = z.object({
  node_fields: z.array(nodeFieldSchema),
  node_types: z.tuple([z.array(nodeTypeSchema)]).rest(z.string()),
  edge_fields: z.array(edgeFieldSchema),
  edge_types: z.tuple([z.array(edgeTypeSchema)]).rest(z.string()),
  // TODO: What are the following?
  trace_function_info_fields: z.array(traceFunctionInfoFieldsSchema),
  trace_node_fields: z.array(traceNodeFieldsSchema),
  sample_fields: z.array(sampleFieldsSchema),
  location_fields: z.array(locationFieldsSchema),
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
