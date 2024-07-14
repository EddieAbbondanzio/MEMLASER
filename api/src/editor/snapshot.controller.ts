import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Get,
  Post,
  ServiceUnavailableException,
  UseInterceptors,
} from "@nestjs/common";
import { SnapshotService } from "./snapshot.service.js";
import { Snapshot } from "./snapshot.js";
import { IsNotEmpty } from "class-validator";

class ImportSnapshotDTO {
  @IsNotEmpty()
  path!: string;
}

@Controller("snapshots")
export class SnapshotController {
  constructor(private readonly snapshotService: SnapshotService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getAvailable(): Promise<Snapshot[]> {
    const snapshots = await this.snapshotService.getAvailableSnapshots();
    return snapshots;
  }

  @Post("import")
  async import(@Body() { path }: ImportSnapshotDTO): Promise<Snapshot> {
    try {
      const snapshot = await this.snapshotService.importSnapshot(path);
      return snapshot;
    } catch (err) {
      if (/already exists/.test((err as Error).message)) {
        throw new ConflictException("Snapshot has already been imported.");
      } else {
        throw new ServiceUnavailableException();
      }
    }
  }
}
