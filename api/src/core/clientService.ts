import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { ClientEvent } from "./clientEvents.js";

@Injectable()
export class ClientService {
  private clients: Map<string, Socket> = new Map();

  registerClient(client: Socket) {
    this.clients.set(client.id, client);
  }

  deregisterClient(client: Socket): void {
    this.clients.delete(client.id);
  }

  async dispatchEvent(clientId: string, event: ClientEvent): Promise<void> {
    const client = this.clients.get(clientId);
    if (client === undefined) {
      throw new Error(`No client found for Id: ${clientId}`);
    }

    client.send(JSON.stringify(event));
  }
}
