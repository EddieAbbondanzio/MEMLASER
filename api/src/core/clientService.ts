import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class ClientService {
  private clients: Set<Socket> = new Set();

  registerClient(client: Socket): void {
    this.clients.add(client);
  }

  deregisterClient(client: Socket): void {
    this.clients.delete(client);
  }

  // TODO: Think about this more!
  async dispatchEvent(client: any, event: any): Promise<void> {}
}
