import { processSampleSnapshot } from "./devScripts/processSampleSnapshot.js";
import { processSampleGraph } from "./devScripts/processSampleGraph.js";
import { DevScriptDefinition, startRepl } from "@memlaser/core";
import { insertEdge, insertNode } from "./devScripts/utils.js";
import { SQLITE_IN_MEMORY, initializeSQLiteDB } from "@memlaser/database";

const SCRIPT_MAP: Record<string, DevScriptDefinition> = {
  processSampleSnapshot,
  processSampleGraph,
};

// "magic"
void startRepl(SCRIPT_MAP, context => {
  context.initTempDB = () => initializeSQLiteDB(SQLITE_IN_MEMORY);
  context.insertNode = insertNode;
  context.insertEdge = insertEdge;
});
