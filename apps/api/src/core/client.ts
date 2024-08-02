import { WebSocket } from "ws";
import { SnapshotStatsDTO } from "../editor/dtos/snapshotStats.js";

export type ClientEvent =
  | { type: "CLIENT_ID"; clientId: string }
  | { type: "IMPORT_SNAPSHOT_PROGRESS"; snapshotName: string; message: string }
  | {
      type: "IMPORT_SNAPSHOT_SUCCESS";
      snapshotName: string;
      stats: SnapshotStatsDTO;
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
