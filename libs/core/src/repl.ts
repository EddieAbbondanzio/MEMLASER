import repl from "node:repl";
import { Context } from "node:vm";

export interface DevScriptDefinition {
  description: string;
  execute: (question: Question) => Promise<unknown>;
}

export type DevScriptMap = Record<string, DevScriptDefinition>;
export type Question = (query: string) => Promise<string>;

export async function startRepl(
  scriptMap: DevScriptMap,
  extendContext?: (context: Context) => void,
): Promise<void> {
  console.log("Type '.scripts' to see list of available dev scripts.");

  const server = repl.start({
    prompt: ">",
  });

  async function question(query: string): Promise<string> {
    return new Promise(res => {
      server.question(query, res);
    });
  }

  server.defineCommand("scripts", {
    help: "A list of handy scripts for development.",
    action: async () => {
      console.log("====");
      console.log("Scripts:");

      const entries = Object.entries(scriptMap);
      for (let i = 0; i < entries.length; i++) {
        const [scriptName, definition] = entries[i];
        console.log(`${i}: ${scriptName} - ${definition.description}`);
      }
      console.log("====");

      try {
        const rawNumber = await question("Enter number:");
        const num = Number.parseInt(rawNumber);
        if (isNaN(num)) {
          console.log("Bad input.");
          return;
        }

        const script = entries[num][1];
        await script.execute(question);
      } catch (err) {
        console.error("Script failed.");
        console.error(err);
      }
    },
  });

  if (extendContext != null) {
    extendContext(server.context);
  }
}
