import { Injectable } from "@nestjs/common";
import { Client } from "./client.js";
import { nanoid } from "nanoid";
import * as ws from "ws";

interface ExtendedWebSocket extends ws.WebSocket {
  id: string;
}

@Injectable()
export class ClientService {
  private clients: Map<string, Client> = new Map();

  getClient(clientId: string): Client | undefined {
    return this.clients.get(clientId);
  }

  registerClient(socket: ws.WebSocket): Client {
    const id = nanoid(16);
    const client = new Client(id, socket);
    this.clients.set(id, client);
    (socket as ExtendedWebSocket).id = client.id;

    console.log("Registered client ", id);
    return client;
  }

  deregisterClient(client: ws.WebSocket): void {
    const { id } = client as ExtendedWebSocket;
    this.clients.delete(id);

    console.log("Deregistered client ", id);
  }
}
