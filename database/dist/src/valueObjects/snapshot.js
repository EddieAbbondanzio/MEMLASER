// TODO: Move these to entity specific files if we ever begin utilizing them.
export var TraceFunctionInfoField;
(function (TraceFunctionInfoField) {
    TraceFunctionInfoField["FunctionId"] = "function_id";
    TraceFunctionInfoField["Name"] = "name";
    TraceFunctionInfoField["ScriptName"] = "script_name";
    TraceFunctionInfoField["ScriptId"] = "script_id";
    TraceFunctionInfoField["Line"] = "line";
    TraceFunctionInfoField["Column"] = "column";
})(TraceFunctionInfoField || (TraceFunctionInfoField = {}));
export var TraceNodeField;
(function (TraceNodeField) {
    TraceNodeField["Id"] = "id";
    TraceNodeField["FunctionInfoIndex"] = "function_info_index";
    TraceNodeField["Count"] = "count";
    TraceNodeField["Size"] = "size";
    TraceNodeField["Children"] = "children";
})(TraceNodeField || (TraceNodeField = {}));
export var SampleField;
(function (SampleField) {
    SampleField["TimestampUS"] = "timestamp_us";
    SampleField["LastAssignedId"] = "last_assigned_id";
})(SampleField || (SampleField = {}));
export var LocationField;
(function (LocationField) {
    LocationField["ObjectIndex"] = "object_index";
    LocationField["ScriptId"] = "script_id";
    LocationField["Line"] = "line";
    LocationField["Column"] = "column";
})(LocationField || (LocationField = {}));
//# sourceMappingURL=snapshot.js.map