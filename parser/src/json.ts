import { chain } from "stream-chain";
import * as fs from "fs";
import { parser } from "stream-json";
import { pick } from "stream-json/filters/Pick";
import { streamObject } from "stream-json/streamers/StreamObject";
import { streamArray } from "stream-json/streamers/StreamArray";
import { HeapSnapshot, Snapshot } from "./snapshot";

interface ParserCallbacks {
  onSnapshot: (snapshot: Snapshot) => Promise<void>;
  onNodeBatch: (nodes: HeapSnapshot["nodes"]) => Promise<void>;
  onEdgeBatch: (edges: HeapSnapshot["edges"]) => Promise<void>;
  onStringBatch: (strings: HeapSnapshot["strings"]) => Promise<void>;
  // TODO: Implement callbacks for:
  //   - trace_function_infos
  //   - trace_tree
  //   - samples
  //   - locations
}

// I'd love a syntax like this:
// const p = await parseJSON("foo.txt");
// p.on("snapshot", () => {
//   // Handle the snapshot data
// })
// p.on("nodeBatch", () => {
//   // Insert raw nodes into a temp db table so we can process later once the rest
//   // of the file has been parsed.
// })
// p.on("traceFunctionInfoBatch", () => {
//   // TODO: Skip this for now.
// })
// p.on("traceTreeBatch", () => {
//   // TODO: Skip this for now.
// })
// p.on("sampleBatch", () => {
//   // TODO: Skip this for now.
// })
// p.on("locationBatch", () => {
//   // TODO: Skip this for now.
// })
// p.on("edgeBatch", () => {
//   // Insert edges into a temp db table so we can process later on once the rest
//   // of the file has been parsed.
// })
// p.on("stringBatch", () => {
//   // Insert edges into a temp db table so we can process later on once the rest
//   // of the file has been parsed.
// })

export async function parseSnapshot(path: string): Promise<any> {
  console.log("===");
  console.log("Init parser!");
  console.log("===");

  // Let's parse the raw tokens. This really shouldn't be that bad!
  const pipeline = chain([
    fs.createReadStream(path),
    parser({ packStrings: false }),
    pick({ filter: "snapshot" }),
    data => {
      console.log("GOT SNAPSHOT DATA!", data);
    },
  ]);
}
