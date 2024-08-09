import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import { SnapshotService } from "./snapshot.service.js";
import {
  ImportSnapshotErrorCode,
  SnapshotBeingImportedDTO,
  SnapshotDTO,
} from "./dtos/snapshot.js";
import { IsNotEmpty } from "class-validator";
import { Request } from "express";

class ImportSnapshotDTO {
  @IsNotEmpty()
  path!: string;
}

@Controller("snapshots")
export class SnapshotController {
  constructor(private readonly snapshotService: SnapshotService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getAvailable(): Promise<SnapshotDTO[]> {
    const snapshots = await this.snapshotService.getAvailableSnapshots();
    return snapshots;
  }

  @Post("import")
  @HttpCode(HttpStatus.ACCEPTED)
  async import(
    @Req() { client }: Request,
    @Body() { path }: ImportSnapshotDTO,
  ): Promise<SnapshotBeingImportedDTO> {
    const res = await this.snapshotService.canImportFile(path);
    if (!res.valid) {
      switch (res.errorCode) {
        case ImportSnapshotErrorCode.Duplicate:
          throw new ConflictException(res.errorMessage);
        case ImportSnapshotErrorCode.InvalidFile:
          throw new BadRequestException(res.errorMessage);
        default:
          throw new Error(`Unknown validation result: ${res.errorMessage}`);
      }
    }

    const snapshot = await this.snapshotService.importSnapshot(path, {
      onProgress: (name, message) => {
        client.dispatchEvent({
          type: "IMPORT_SNAPSHOT_PROGRESS",
          snapshotName: name,
          message,
        });
      },
      onSuccess: (name, stats) => {
        client.dispatchEvent({
          type: "IMPORT_SNAPSHOT_SUCCESS",
          snapshotName: name,
          stats: {
            fileSize: stats.fileSize,
            createdAt: stats.createdAt,
            importedAt: stats.importedAt,
          },
        });
      },
      onFailure: (name, errorMessage) => {
        client.dispatchEvent({
          type: "IMPORT_SNAPSHOT_FAILURE",
          snapshotName: name,
          errorMessage,
        });
      },
    });

    return snapshot;
  }
}
