import { Module } from "@nestjs/common";
import { SnapshotController } from "./snapshot.controller.js";
import { SnapshotService } from "./snapshot.service.js";

@Module({
  imports: [],
  controllers: [SnapshotController],
  providers: [SnapshotService],
})
export class EditorModule {
  
}
