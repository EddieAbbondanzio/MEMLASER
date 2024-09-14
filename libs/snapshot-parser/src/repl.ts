import repl from "node:repl";
import { z } from "zod";
import { parseSnapshotToSQLite } from "./index.js";

enum Script {
  ProcessSampleSnapshot = 1,
  ProcessSampleGraph = 2,
}

interface ScriptDefinition {
  description: string;
  execute: () => Promise<unknown>;
}

const SCRIPT_MAP: Record<Script, ScriptDefinition> = {
  [Script.ProcessSampleSnapshot]: {
    description: "Process a sample snapshot",
    execute: async () => {
      await parseSnapshotToSQLite({
        // TODO: Add support for allowing other sample snapshots.
        snapshotPath: "samples/foo-bar.heapsnapshot",
        outputPath: "out/foo-bar.sqlite",
        overwriteExisting: true,
        logger: console.log,
      });
    },
  },
  [Script.ProcessSampleGraph]: {
    description: "Process sample graph (via processGraph())",
    execute: async () => {
      console.log("Calculating (not really)...");
    },
  },
};

const scriptsSchema = z.nativeEnum(Script);

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

      const script = await scriptsSchema.parseAsync(num);
      const def = SCRIPT_MAP[script];
      await def.execute();
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
