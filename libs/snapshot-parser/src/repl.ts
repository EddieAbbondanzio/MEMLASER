import { processSampleSnapshot } from "./devScripts/processSampleSnapshot.js";
import { processSampleGraph } from "./devScripts/processSampleGraph.js";
import { DevScriptDefinition, startRepl } from "@memlaser/core";

const SCRIPT_MAP: Record<string, DevScriptDefinition> = {
  processSampleSnapshot,
  processSampleGraph,
};

// "magic"
void startRepl(SCRIPT_MAP);
