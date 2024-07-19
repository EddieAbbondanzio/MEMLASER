import { EdgeField, EdgeType } from "./edge.js";
import { NodeField, NodeType } from "./node.js";

// Keep in sync with metaJSONSchema in snapshot-parser.
export interface MetaJSON {
  node_fields: NodeField[];
  node_types: [NodeType[], ...string[]];
  edge_fields: EdgeField[];
  edge_types: EdgeType[];
}
