import { Injectable, OnModuleInit } from "@nestjs/common";
import { DATA_DIR } from "../core/config.js";
import fs from "node:fs";
import path from "node:path";
import { Snapshot } from "./snapshot.js";
import { initializeSQLiteDB, SnapshotStats } from "@memlaser/database";

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
    const snapshotFiles = (
      await fs.promises.readdir(this.snapshotDirectoryPath)
    ).filter((f) => /.*\.sqlite/.test(f));

    const snapshots: Snapshot[] = [];
    for (const sf of snapshotFiles) {
      const snapshotPath = path.join(this.snapshotDirectoryPath, sf);
      const nameNoExtension = path.parse(snapshotPath).name;
      const stats = await this._getSnapshotStats(snapshotPath);

      snapshots.push(
        new Snapshot(
          nameNoExtension,
          snapshotPath,
          stats.size,
          stats.importedAt,
        ),
      );
    }

    return snapshots;
  }

  async importSnapshot(p: string): Promise<Snapshot> {
    const importPath = path.parse(p);
    const outputPath = path.join(
      this.snapshotDirectoryPath,
      `${importPath.name}.sqlite`,
    );
    const stats = await this._getSnapshotStats(outputPath);

    return new Snapshot(
      importPath.name,
      outputPath,
      stats.size,
      stats.importedAt,
    );
  }

  async _getSnapshotStats(snapshotPath: string): Promise<SnapshotStats> {
    const db = await initializeSQLiteDB(snapshotPath);
    const stats = await db
      .createQueryBuilder(SnapshotStats, "snapshot_stats")
      .select()
      .getOneOrFail();
    await db.destroy();

    return stats;
  }
}
