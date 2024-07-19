import { EdgeField, EdgeType } from "./edge.js";
import { NodeField, NodeType } from "./node.js";
export interface MetaJSON {
    node_fields: NodeField[];
    node_types: [NodeType[], ...string[]];
    edge_fields: EdgeField[];
    edge_types: EdgeType[];
}
//# sourceMappingURL=snapshot.d.ts.map