import { Edge } from "./edge";

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

export interface NodeData {
  nodeIndex: number;
  type: NodeObjectType;
  name: string;
  id: number;
  selfSize: number;
  edgeCount: number;
  traceNodeId: number;
  detached: boolean;
}
export type NodeObjectType = keyof NodeTypes[0];

export class Node {
  public type: NodeObjectType;
  public name: string;
  public id: number;
  // Edges are set when we rebuild the graph tree.
  public edges!: Edge[];

  private data: NodeData;

  constructor(data: NodeData) {
    const { type, name, id } = data;
    this.type = type;
    this.name = name;
    this.id = id;

    this.data = data;
  }
}
