import dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { HTTP_PORT } from "./core/config.js";
import { AppModule } from "./app.module.js";
import { WsAdapter } from "@nestjs/platform-ws";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Validates incoming JSON to classes.
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(HTTP_PORT);
  console.log(`Application listening at: ${await app.getUrl()}`);
  console.log("-- node env 2: ", process.env.NODE_ENV);
}
bootstrap();
