import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from "@nestjs/websockets";
import { ClientService } from "./clientService.js";
import { WsAdapter } from "@nestjs/platform-ws";
import { WebSocket } from "ws";

@WebSocketGateway({
  transports: ["websocket"],
  cors: { origin: "*" },
  path: "/events",
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: WsAdapter;

  constructor(private clientService: ClientService) {}

  handleConnection(socket: WebSocket) {
    const client = this.clientService.registerClient(socket);
    client.dispatchEvent({
      type: "CLIENT_ID",
      clientId: client.id,
    });
  }

  handleDisconnect(socket: WebSocket) {
    this.clientService.deregisterClient(socket);
  }
}
