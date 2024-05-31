import { Node } from "./node";

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

export interface EdgeData {
  type: EdgeObjectType;
  name: string;
  toNode: number;
}

export class Edge {
  public type: EdgeObjectType;
  public name: string;
  // Nodes are set when we rebuild the the graph tree.
  public from!: Node;
  public to!: Node;

  private data: EdgeData;

  constructor(data: EdgeData) {
    const { type, name } = data;
    this.type = type;
    this.name = name;

    this.data = data;
  }
}
