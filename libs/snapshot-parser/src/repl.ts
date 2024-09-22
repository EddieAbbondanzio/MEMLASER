import { processSampleSnapshot } from "./devScripts/processSampleSnapshot.js";
import {
  TMP_DIR,
  processSampleGraph,
} from "./devScripts/processSampleGraph.js";
import { DevScriptDefinition, startRepl } from "@memlaser/core";
import { insertEdge, insertNode } from "./devScripts/utils.js";
import {
  Edge,
  Node,
  SQLITE_IN_MEMORY,
  initializeSQLiteDB,
  openSQLiteDB,
} from "@memlaser/database";
import * as pathLib from "node:path";

const SCRIPT_MAP: Record<string, DevScriptDefinition> = {
  processSampleSnapshot,
  processSampleGraph,
};

// "magic"
void startRepl(SCRIPT_MAP, context => {
  // Models
  context.Node = Node;
  context.Edge = Edge;

  context.initTempDB = () => initializeSQLiteDB(SQLITE_IN_MEMORY);
  context.loadTempDB = (name: string) =>
    openSQLiteDB(pathLib.join(TMP_DIR, name));
  context.insertNode = insertNode;
  context.insertEdge = insertEdge;
});
