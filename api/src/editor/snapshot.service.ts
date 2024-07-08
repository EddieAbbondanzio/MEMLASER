import { Injectable, OnModuleInit } from "@nestjs/common";
import { DATA_DIR } from "../config.js";
import fs from "node:fs";
import path from "node:path";
import { Snapshot } from "./snapshot.js";

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
        return new Snapshot(nameNoExtension, snapshotPath);
      });

    return snapshots;
  }
}
