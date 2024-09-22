import { Injectable, OnModuleInit } from "@nestjs/common";
import { DATA_DIR } from "../core/config.js";
import * as pathLib from "node:path";
import {
  ImportSnapshotErrorCode,
  ImportSnapshotValidationDTO,
  SnapshotBeingImportedDTO,
  SnapshotDTO,
  SnapshotState,
} from "./dtos/snapshot.js";
import { openSQLiteDB, SnapshotStats } from "@memlaser/database";
import { parseSnapshotToSQLite } from "@memlaser/snapshot-parser";
import { DataSource } from "typeorm";
import { pick, sortBy } from "lodash-es";
import * as fsLib from "node:fs";

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
    if (!fsLib.existsSync(DATA_DIR)) {
      await fsLib.promises.mkdir(DATA_DIR);
    }

    if (!fsLib.existsSync(this.snapshotDirectoryPath)) {
      await fsLib.promises.mkdir(this.snapshotDirectoryPath);
    }
  }

  async getAvailableSnapshots(): Promise<SnapshotDTO[]> {
    const snapshotFiles = (
      await fsLib.promises.readdir(this.snapshotDirectoryPath)
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

  async doesSnapshotExist(name: string): Promise<boolean> {
    const path = this.buildSnapshotPath(name);
    return fsLib.existsSync(path);
  }

  buildSnapshotPath(name: string): string {
    const path = pathLib.join(this.snapshotDirectoryPath, `${name}.sqlite`);
    return path;
  }

  async canImportFile(path: string): Promise<ImportSnapshotValidationDTO> {
    const importPath = pathLib.parse(path);
    if (importPath.ext !== ".heapsnapshot") {
      return {
        valid: false,
        errorCode: ImportSnapshotErrorCode.InvalidFile,
        errorMessage: "Only .heapsnapshot files can be imported.",
      };
    }

    const outputPath = pathLib.join(
      this.snapshotDirectoryPath,
      `${importPath.name}.sqlite`,
    );
    if (fsLib.existsSync(outputPath)) {
      return {
        valid: false,
        errorCode: ImportSnapshotErrorCode.Duplicate,
        errorMessage: `Snapshot ${importPath.base} has already been imported.`,
      };
    }

    return { valid: true };
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
      } finally {
        // Output file might not exist if the file errored out before the first
        // insert.
        if (fsLib.existsSync(outputPath)) {
          await fsLib.promises.rm(outputPath);
        }
      }
    })();

    return {
      state: SnapshotState.Importing,
      name,
      path: outputPath,
    };
  }

  async deleteSnapshot(name: string): Promise<boolean> {
    const fullPath = pathLib.join(this.snapshotDirectoryPath, `${name}.sqlite`);
    if (!fsLib.existsSync(fullPath)) {
      return false;
    }

    await fsLib.promises.rm(fullPath);
    return true;
  }

  // Accepts either the path to a sqlite file, or the loaded SQLite db.
  async _getSnapshotStats(
    snapshot: string | DataSource,
  ): Promise<SnapshotStats> {
    let db;
    if (typeof snapshot === "string") {
      db = await openSQLiteDB(snapshot);
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
