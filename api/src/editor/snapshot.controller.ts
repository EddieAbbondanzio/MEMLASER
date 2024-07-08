import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
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
  async getAll(): Promise<Snapshot[]> {
    const snapshots = await this.snapshotService.getAvailableSnapshots();
    return snapshots;
  }

  @Post("import")
  import(@Body() importDTO: ImportSnapshotDTO): void {
    console.log("GOT: ", importDTO);
    // TODO: Create the snapshot
    // return new Snapshot("foo/bar.heapsnapshot");
  }
}
