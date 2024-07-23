import { Test } from "@nestjs/testing";
import { SnapshotService } from "../../../src/editor/snapshot.service.js";

// N.B. Because we need to support mocking ES modules, this code needs to be
// imported into the test file that uses it.
export async function createSnapshotService(): Promise<SnapshotService> {
  const moduleRef = await Test.createTestingModule({
    providers: [SnapshotService],
  }).compile();
  return moduleRef.get<SnapshotService>(SnapshotService);
}
