import { NestFactory } from "@nestjs/core";
import { EditorModule } from "./editor/editor.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(EditorModule);
  // Validates incoming JSON to classes.
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
