export var NodeType;
(function (NodeType) {
    NodeType["Hidden"] = "hidden";
    NodeType["Array"] = "array";
    NodeType["String"] = "string";
    NodeType["Object"] = "object";
    NodeType["Code"] = "code";
    NodeType["Closure"] = "closure";
    NodeType["Regexp"] = "regexp";
    NodeType["Number"] = "number";
    NodeType["Native"] = "native";
    NodeType["Synthetic"] = "synthetic";
    NodeType["ConcatenatedString"] = "concatenated string";
    NodeType["SlicedString"] = "sliced string";
    NodeType["Symbol"] = "symbol";
    NodeType["BigInt"] = "bigint";
    NodeType["ObjectShape"] = "object shape";
})(NodeType || (NodeType = {}));
export var NodeField;
(function (NodeField) {
    NodeField["Type"] = "type";
    NodeField["Name"] = "name";
    NodeField["Id"] = "id";
    NodeField["SelfSize"] = "self_size";
    NodeField["EdgeCount"] = "edge_count";
    NodeField["Detachedness"] = "detachedness";
    NodeField["TraceNodeId"] = "trace_node_id";
})(NodeField || (NodeField = {}));
//# sourceMappingURL=node.js.map