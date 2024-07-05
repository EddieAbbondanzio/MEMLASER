import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import { SnapshotService } from "./snapshot.service";
import { Snapshot } from "./snapshot";
import { IsNotEmpty } from "class-validator";

class ImportSnapshotDTO {
  @IsNotEmpty()
  path: string;
}

@Controller("snapshots")
export class SnapshotController {
  constructor(private readonly snapshotService: SnapshotService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  getAll(): Snapshot[] {
    // TODO: Load snapshots from data dir.
    return [new Snapshot("foo/bar.heapsnapshot")];
  }

  @Post("import")
  import(@Body() importDTO: ImportSnapshotDTO): Snapshot {
    console.log("GOT: ", importDTO);
    // TODO: Create the snapshot
    return new Snapshot("foo/bar.heapsnapshot");
  }
}
