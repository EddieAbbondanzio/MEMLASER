import { Injectable, OnModuleInit } from "@nestjs/common";
import { DATA_DIR } from "../core/config.js";
import fs from "node:fs";
import path from "node:path";
import { Snapshot } from "./snapshot.js";
import { parseSnapshotToSQLite } from "@memlaser/snapshot-parser";

// Snapshots (.sqlite) files live inside a snapshot dir within the data dir.

@Injectable()
export class SnapshotService implements OnModuleInit {
  // Safe to assert as non-null because onModuleInit runs before the API starts
  // handling incoming requests.
  snapshotDirectoryPath!: string;

  async onModuleInit(): Promise<void> {
    // Create data directory if it doesn't exist.
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR);
    }

    this.snapshotDirectoryPath = path.join(DATA_DIR, "snapshots");
    if (!fs.existsSync(this.snapshotDirectoryPath)) {
      await fs.promises.mkdir(this.snapshotDirectoryPath);
    }
  }

  async getAvailableSnapshots(): Promise<Snapshot[]> {
    const snapshots = (await fs.promises.readdir(this.snapshotDirectoryPath))
      .filter((f) => /.*\.sqlite/.test(f))
      .map((f) => {
        const snapshotPath = path.join(this.snapshotDirectoryPath, f);
        const nameNoExtension = path.parse(snapshotPath).name;

        // TODO: Devise how to store imported date, and OG heap file size.
        // We need to either store this in a separate json file ex: (appState.json)
        // or put it in the SQLite files and query each one we render in the sidebar.

        const fstat = fs.statSync(snapshotPath);
        const importedAt = new Date(fstat.birthtimeMs);

        return new Snapshot(
          nameNoExtension,
          snapshotPath,
          "100 mb",
          importedAt,
        );
      });

    return snapshots;
  }

  async importSnapshot(p: string): Promise<Snapshot> {
    const importPath = path.parse(p);
    const outputPath = path.join(
      this.snapshotDirectoryPath,
      `${importPath.name}.sqlite`,
    );

    const ds = await parseSnapshotToSQLite({
      snapshotPath: p,
      outputPath,
    });
    await ds.destroy();

    return new Snapshot(importPath.name, outputPath, "101mb", new Date());
  }
}