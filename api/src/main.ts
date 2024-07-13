import dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { EditorModule } from "./editor/editor.module.js";
import { ValidationPipe } from "@nestjs/common";
import { HTTP_PORT } from "./core/config.js";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Validates incoming JSON to classes.
  app.useGlobalPipes(new ValidationPipe());
  console.log("node env 2: ", process.env.NODE_ENV);
  await app.listen(HTTP_PORT);
}
bootstrap();
