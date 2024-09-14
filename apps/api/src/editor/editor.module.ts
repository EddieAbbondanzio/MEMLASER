import { Module } from "@nestjs/common";
import { SnapshotController } from "./snapshot.controller.js";
import { SnapshotService } from "./snapshot.service.js";
import { SummaryService } from "./summary.service.js";

@Module({
  imports: [],
  controllers: [SnapshotController],
  providers: [SnapshotService, SummaryService],
})
export class EditorModule {}
