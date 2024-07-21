import { Injectable, OnModuleInit } from "@nestjs/common";
import { DATA_DIR } from "../core/config.js";
import fs from "node:fs";
import path from "node:path";
import { Snapshot } from "./snapshot.js";
import { initializeSQLiteDB, SnapshotStats } from "@memlaser/database";
import { parseSnapshotToSQLite } from "@memlaser/snapshot-parser";
import { DataSource } from "typeorm";

@Injectable()
export class SnapshotService implements OnModuleInit {
  snapshotDirectoryPath: string = path.join(DATA_DIR, "snapshots");

  async onModuleInit(): Promise<void> {
    console.log("ON MODULE INIT!@");
    // Create data directory if it doesn't exist.
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR);
    }

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

    const db = await parseSnapshotToSQLite({
      snapshotPath: p,
      outputPath,
      overwriteExisting: false,
    });
    const stats = await this._getSnapshotStats(db);

    return new Snapshot(
      importPath.name,
      outputPath,
      stats.size,
      stats.importedAt,
    );
  }

  // Accepts either the path to a sqlite file, or the loaded SQLite db.
  async _getSnapshotStats(
    snapshot: string | DataSource,
  ): Promise<SnapshotStats> {
    let db;
    if (typeof snapshot === "string") {
      db = await initializeSQLiteDB(snapshot);
    } else {
      db = snapshot;
    }

    const stats = await db
      .createQueryBuilder(SnapshotStats, "snapshot_stats")
      .select()
      .getOneOrFail();
    await db.destroy();

    return stats;
  }
}
