import { EdgeField, EdgeType } from "./edge.js";
import { NodeField, NodeType } from "./node.js";

export interface Meta {
  nodeFields: NodeField[];
  nodeTypes: [NodeType[], ...string[]];
  edgeFields: EdgeField[];
  edgeTypes: [EdgeType[], ...string[]];
  traceFunctionInfoFields: TraceFunctionInfoField[];
  traceNodeFields: TraceNodeField[];
  sampleFields: SampleField[];
  locationFields: LocationField[];
}

// TODO: Move these to entity specific files if we ever begin utilizing them.
export enum TraceFunctionInfoField {
  FunctionId = "function_id",
  Name = "name",
  ScriptName = "script_name",
  ScriptId = "script_id",
  Line = "line",
  Column = "column",
}
export enum TraceNodeField {
  Id = "id",
  FunctionInfoIndex = "function_info_index",
  Count = "count",
  Size = "size",
  Children = "children",
}
export enum SampleField {
  TimestampUS = "timestamp_us",
  LastAssignedId = "last_assigned_id",
}
export enum LocationField {
  ObjectIndex = "object_index",
  ScriptId = "script_id",
  Line = "line",
  Column = "column",
}
