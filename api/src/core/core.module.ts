import { Module } from "@nestjs/common";
import { WebsocketGateway } from "./websocket.gateway.js";
import { ClientService } from "./clientService.js";

@Module({
  providers: [WebsocketGateway, ClientService],
})
export class CoreModule {}
