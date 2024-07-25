import { SnapshotStats } from "@memlaser/database";
import { WebSocket } from "ws";

export type ClientEvent =
  | { type: "CLIENT_ID"; clientId: string }
  | { type: "IMPORT_SNAPSHOT_PROGRESS"; snapshotName: string; message: string }
  | {
      type: "IMPORT_SNAPSHOT_SUCCESS";
      snapshotName: string;
      stats: SnapshotStats;
    }
  | { type: "IMPORT_SNAPSHOT_FAILURE"; snapshotName: string; message: string };

export class Client {
  constructor(
    public id: string,
    public socket: WebSocket,
  ) {}

  dispatchEvent(event: ClientEvent): void {
    this.socket.send(JSON.stringify(event));
  }
}
