import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { Client } from "./client.js";

@Injectable()
export class ClientService {
  private clients: Map<string, Client> = new Map();

  getClient(clientId: string): Client | undefined {
    return this.clients.get(clientId);
  }

  registerClient(socket: Socket): Client {
    const { id } = socket;
    const client = new Client(id, socket);
    this.clients.set(id, client);
    return client;
  }

  deregisterClient(client: Socket): void {
    this.clients.delete(client.id);
  }
}
