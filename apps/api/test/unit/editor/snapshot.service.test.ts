import { test, describe, beforeEach, mock } from "node:test";
import { DATA_DIR } from "../../../src/core/config.js";
import assert from "node:assert";
import {
  ImportSnapshotCallbacks,
  SnapshotService,
} from "../../../src/editor/snapshot.service.js";
import esmock from "esmock";
import * as memfs from "memfs";
import path from "node:path";
import { subDays } from "date-fns";
import { SnapshotState } from "../../../src/editor/dtos/snapshot.js";

describe("SnapshotService", async () => {
  const fs = memfs.fs;

  const { createSnapshotService } = await esmock(
    "./createSnapshotService.js",
    {},
    {
      fs: memfs.fs,
      "@memlaser/snapshot-parser": {
        parseSnapshotToSQLite: () => {},
      },
    },
  );

  let snapshotService: SnapshotService;

  beforeEach(async () => {
    memfs.vol.reset();
    snapshotService = await createSnapshotService();
  });

  test("onModuleInit creates data dir and snapshot dir if missing", async () => {
    // Empty FS, no data dir
    memfs.vol.fromJSON({});
    await snapshotService.onModuleInit();

    assert.strictEqual(
      fs.existsSync(DATA_DIR),
      true,
      "Data directory was missing.",
    );

    assert.strictEqual(
      fs.existsSync(snapshotService.snapshotDirectoryPath),
      true,
      "Snapshot directory was missing.",
    );
  });

  test("onModuleInit creates snapshot dir if missing", async () => {
    memfs.vol.fromJSON({
      [DATA_DIR]: null,
    });
    await snapshotService.onModuleInit();

    assert.strictEqual(
      fs.existsSync(snapshotService.snapshotDirectoryPath),
      true,
      "Snapshot directory was missing.",
    );
  });

  test("getAvailableSnapshots", async () => {
    const { snapshotDirectoryPath } = snapshotService;

    memfs.vol.fromJSON({
      [path.join(snapshotDirectoryPath, "foo.sqlite")]: "",
      [path.join(snapshotDirectoryPath, "bar.sqlite")]: "",
      // Should be ignored
      [path.join(snapshotDirectoryPath, "random.txt")]: "",
    });

    snapshotService._getSnapshotStats = mock.fn(async (path: string) => {
      if (path.endsWith("foo.sqlite")) {
        return {
          id: 1,
          size: 1000,
          importedAt: subDays(new Date(), 1),
          createdAt: subDays(new Date(), 1),
        };
      } else if (path.endsWith("bar.sqlite")) {
        return {
          id: 2,
          size: 2000,
          importedAt: subDays(new Date(), 2),
          createdAt: subDays(new Date(), 2),
        };
      } else {
        throw new Error(`Unexpected path ${path}`);
      }
    });

    const snapshots = await snapshotService.getAvailableSnapshots();
    assert.strictEqual(snapshots[0].name, "bar");
    assert.strictEqual(snapshots[1].name, "foo");
  });

  test("importSnapshot", async () => {
    memfs.vol.fromJSON({
      [snapshotService.snapshotDirectoryPath]: null,
    });
    snapshotService._getSnapshotStats = mock.fn(async (_path: string) => {
      return {
        id: 1,
        size: 1000,
        importedAt: subDays(new Date(), 1),
        createdAt: subDays(new Date(), 1),
      };
    });

    const callbacks: ImportSnapshotCallbacks = {
      onSuccess: () => {},
      onFailure: () => {},
      onProgress: () => {},
    };
    const snapshot = await snapshotService.importSnapshot(
      "bar.heapsnapshot",
      callbacks,
    );
    assert.strictEqual(snapshot.name, "bar");
    assert.strictEqual(snapshot.state, SnapshotState.Importing);
    assert.strictEqual(snapshot.state, SnapshotState.Importing);
  });
});
