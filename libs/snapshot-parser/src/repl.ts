import repl from "node:repl";
import { processSampleSnapshot } from "./devScripts/processSampleSnapshot.js";
import { processSampleGraph } from "./devScripts/processSampleGraph.js";

export interface DevScriptDefinition {
  description: string;
  execute: () => Promise<unknown>;
}

const SCRIPT_MAP: Record<string, DevScriptDefinition> = {
  processSampleSnapshot,
  processSampleGraph,
};

console.log("Type '.scripts' to see list of available dev scripts.");
const server = repl.start({
  prompt: ">",
});
server.defineCommand("scripts", {
  help: "A list of handy scripts for development.",
  action: async () => {
    console.log("====");
    console.log("Scripts:");
    for (const [script, def] of Object.entries(SCRIPT_MAP)) {
      console.log(`${script}: ${def.description}`);
    }
    console.log("====");

    try {
      const rawNumber = await question("Enter number:");
      const num = Number.parseInt(rawNumber);
      if (isNaN(num)) {
        console.log("Bad input.");
        return;
      }

      const script = Object.values(SCRIPT_MAP)[num];
      await script.execute();
    } catch (err) {
      console.error("Script failed.");
      console.error(err);
    }
  },
});

async function question(query: string): Promise<string> {
  return new Promise(res => {
    server.question(query, res);
  });
}
