import { Injectable, OnModuleInit } from "@nestjs/common";
import { DATA_DIR } from "../core/config.js";
import fs from "node:fs";
import pathLib from "node:path";
import {
  SnapshotBeingImportedDTO,
  SnapshotDTO,
  SnapshotState,
} from "./dtos/snapshot.js";
import { initializeSQLiteDB, SnapshotStats } from "@memlaser/database";
import { parseSnapshotToSQLite } from "@memlaser/snapshot-parser";
import { DataSource } from "typeorm";
import { pick, sortBy } from "lodash-es";

export interface ImportSnapshotCallbacks {
  onProgress(snapshotName: string, message: string): void;
  onSuccess(snapshotName: string, snapshotStats: SnapshotStats): void;
  onFailure(snapshotName: string, errorMessage: string): void;
}

@Injectable()
export class SnapshotService implements OnModuleInit {
  snapshotDirectoryPath: string = pathLib.join(DATA_DIR, "snapshots");

  async onModuleInit(): Promise<void> {
    // Create data directory if it doesn't exist.
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR);
    }

    if (!fs.existsSync(this.snapshotDirectoryPath)) {
      await fs.promises.mkdir(this.snapshotDirectoryPath);
    }
  }

  async getAvailableSnapshots(): Promise<SnapshotDTO[]> {
    const snapshotFiles = (
      await fs.promises.readdir(this.snapshotDirectoryPath)
    ).filter((f) => /.*\.sqlite/.test(f));

    const snapshots: SnapshotDTO[] = [];
    for (const sf of snapshotFiles) {
      const snapshotPath = pathLib.join(this.snapshotDirectoryPath, sf);
      const nameNoExtension = pathLib.parse(snapshotPath).name;
      const stats = await this._getSnapshotStats(snapshotPath);

      snapshots.push({
        state: SnapshotState.Imported,
        name: nameNoExtension,
        path: snapshotPath,
        stats: pick(stats, ["createdAt", "importedAt", "fileSize"]),
      });
    }

    // Sort by imported at to ensure we consistently sort the snapshots in the
    // sidebar. Eventually we should make this user customizable.
    return sortBy(snapshots, (s) => s.stats.importedAt);
  }

  async wasSnapshotAlreadyImported(path: string): Promise<boolean> {
    const importPath = pathLib.parse(path);
    const outputPath = pathLib.join(
      this.snapshotDirectoryPath,
      `${importPath.name}.sqlite`,
    );

    return fs.existsSync(outputPath);
  }

  async importSnapshot(
    path: string,
    callbacks: ImportSnapshotCallbacks,
  ): Promise<SnapshotBeingImportedDTO> {
    const { name } = pathLib.parse(path);
    const outputPath = pathLib.join(
      this.snapshotDirectoryPath,
      `${name}.sqlite`,
    );

    // Import is ran within an immediately invoked function to break it out of
    // the flow so we can return snapshot info while we begin to import the
    // snapshot in the background.
    (async () => {
      try {
        const db = await parseSnapshotToSQLite({
          snapshotPath: path,
          outputPath,
          overwriteExisting: false,
          logger: (m) => callbacks.onProgress(name, m),
        });
        const stats = await this._getSnapshotStats(db);

        callbacks.onSuccess(name, stats);
      } catch (err) {
        console.error("Failed to import snapshot.", err);
        callbacks.onFailure(name, (err as Error).message);
      }
    })();

    return {
      state: SnapshotState.Importing,
      name,
      path: outputPath,
    };
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
