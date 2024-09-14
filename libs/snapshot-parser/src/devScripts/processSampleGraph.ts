import { DevScriptDefinition } from "../repl.js";

export const processSampleGraph: DevScriptDefinition = {
  description: "Process sample graph (via processGraph())",
  execute: async () => {
    // TODO:
    // - Create an in memory SQLite db that is fully migrated
    // - Insert some nodes + edges into it
    // - Call processGraph and let it do it's thing.
    console.log("Calculating (not really)...");
  },
};
