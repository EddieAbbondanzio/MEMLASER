import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { WEBSOCKET_PORT } from "./config.js";
import { ClientService } from "./clientService.js";

@WebSocketGateway(WEBSOCKET_PORT)
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private clientService: ClientService) {}

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
    const client = this.clientService.registerClient(socket);
    client.dispatchEvent({
      type: "CLIENT_ID",
      data: socket.id,
    });
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    this.clientService.deregisterClient(socket);
  }
}
