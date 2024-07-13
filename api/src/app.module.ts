import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { EditorModule } from "./editor/editor.module.js";
import { ClientMiddleware } from "./core/client.middleware.js";
import { ClientService } from "./core/clientService.js";

// The root module used to register all other modules, and control global logic.
@Module({
  providers: [ClientService],
  imports: [EditorModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClientMiddleware).forRoutes("*");
  }
}
