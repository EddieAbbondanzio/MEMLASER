import { Injectable } from "@nestjs/common";

@Injectable()
export class SnapshotService {
  getHello(): string {
    return "Hello World!";
  }
}
