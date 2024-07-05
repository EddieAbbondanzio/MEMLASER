import { Injectable } from "@nestjs/common";
import { OS_PATHS } from "../config.js";

@Injectable()
export class SnapshotService {
  dataDirectory: string;

  constructor() {
    this.dataDirectory = OS_PATHS.data;
  }

  async loadSnapshots(): Promise<void> {}
}
