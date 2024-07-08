import dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { EditorModule } from "./editor/editor.module.js";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(EditorModule);
  // Validates incoming JSON to classes.
  app.useGlobalPipes(new ValidationPipe());
  console.log("node env 2: ", process.env.NODE_ENV);
  await app.listen(3000);
}
bootstrap();
