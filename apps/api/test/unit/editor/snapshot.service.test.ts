// import { fs } from "memfs";
import { DATA_DIR } from "../../../src/core/config.js";
// import { Test } from "@nestjs/testing";
// import { SnapshotService } from "../../../src/editor/snapshot.service.js";

// jest.mock("fs", () => fs);
// jest.mock("fs/promises", () => fs.promises);

describe("SnapshotService", async () => {
  // let snapshotService: SnapshotService;

  // beforeEach(async () => {
  //   const moduleRef = await Test.createTestingModule({
  //     providers: [SnapshotService],
  //   }).compile();
  //   snapshotService = moduleRef.get<SnapshotService>(SnapshotService);
  // });

  test("onModuleInit creates data dir if missing", async () => {
    expect(1).toBe(2);
    console.log(DATA_DIR);
    // Creates data dir
    // Creates snapshot dir
  });

  test("onModuleInit creates snapshot dir if missing", async () => {
    // Creates snapshot dir, but not data dir
  });

  test("onModuleInit", async () => {
    // Doesn't call mkdir if it exists
  });

  test("getAvailableSnapshots", async () => {
    // Ignores non snapshot files
    // Builds a snapshot for each sqlite file
  });

  test("importSnapshot", async () => {
    // Imports snapshot (mock parseSnapshotToSqlite and check calls)
    // Mock return value to give it fake stats
    // Confirm it returns matching snapshot
  });
});
