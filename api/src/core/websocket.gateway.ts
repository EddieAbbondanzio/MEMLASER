import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { WEBSOCKET_PORT } from "./config.js";
import { ClientService } from "./clientService.js";

@WebSocketGateway(WEBSOCKET_PORT)
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private clientService: ClientService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.clientService.registerClient(client);
    this.clientService.dispatchEvent(client.id, {
      type: "CLIENT_ID",
      data: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clientService.deregisterClient(client);
  }

  @SubscribeMessage("test")
  handleMessage(client: Socket, payload: any): void {
    console.log(`Message from client ${client.id}: ${payload}`);
  }
}
