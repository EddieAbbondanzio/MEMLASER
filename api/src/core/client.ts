import { Socket } from "socket.io";

export type ClientEvent = { type: "CLIENT_ID"; data: string };

export class Client {
  constructor(
    public id: string,
    public socket: Socket,
  ) {}

  dispatchEvent(event: ClientEvent): void {
    this.socket.send(JSON.stringify(event));
  }
}
