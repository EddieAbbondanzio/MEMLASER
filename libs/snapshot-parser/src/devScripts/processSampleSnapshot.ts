import { DevScriptDefinition } from "@memlaser/core";
import { parseSnapshotToSQLite } from "../index.js";

export const processSampleSnapshot: DevScriptDefinition = {
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
};
