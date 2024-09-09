import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import { SnapshotService } from "./snapshot.service.js";
import {
  ImportSnapshotErrorCode,
  SnapshotBeingImportedDTO,
  SnapshotDTO,
  SummaryGroupDTO,
} from "./dtos/snapshot.js";
import { IsNotEmpty } from "class-validator";
import { Request } from "express";
import { assertUnreachable } from "@memlaser/core";
import { SummaryService } from "./summary.service.js";

class ImportSnapshotDTO {
  @IsNotEmpty()
  path!: string;
}

@Controller("snapshots")
export class SnapshotController {
  constructor(
    private readonly snapshotService: SnapshotService,
    private readonly summaryService: SummaryService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getAvailable(): Promise<SnapshotDTO[]> {
    const snapshots = await this.snapshotService.getAvailableSnapshots();
    return snapshots;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(":name/summary")
  async getSummary(@Param("name") name: string): Promise<SummaryGroupDTO[]> {
    if (!(await this.snapshotService.doesSnapshotExist(name))) {
      throw new NotFoundException(`Snapshot "${name}" not found.`);
    }

    const path = this.snapshotService.buildSnapshotPath(name);
    const summaryGroups = await this.summaryService.getSummary(path);
    return summaryGroups;
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
          assertUnreachable(res.errorCode);
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

  @Delete(":name")
  async deleteSnapshot(@Param("name") name: string): Promise<void> {
    const success = await this.snapshotService.deleteSnapshot(name);
    if (!success) {
      throw new BadRequestException(`Failed to delete snapshot ${name}`);
    }
  }
}
