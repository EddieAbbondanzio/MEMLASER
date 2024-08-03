import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ClientService } from "./clientService.js";
import { Client } from "./client.js";
import { NODE_ENV } from "./config.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      client: Client;
    }
  }
}

const CLIENT_ID_HEADER = "x-client-id";

@Injectable()
export class ClientMiddleware implements NestMiddleware {
  constructor(private readonly clientService: ClientService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const clientId = req.headers[CLIENT_ID_HEADER] as string | undefined;
    if (clientId === undefined) {
      if (NODE_ENV === "development") {
        console.warn(
          `Received request (${req.method} ${req.originalUrl}) without a 'x-client-id' header, but allowing it due to running in development.`,
        );
        next();
        return;
      }

      res.status(404);
      res.json({ message: "Unknown client id." });
      return;
    }

    const client = this.clientService.getClient(clientId);
    if (client === undefined) {
      res.status(404);
      res.json({ message: "Unknown client." });
      return;
    }

    req.client = client;
    next();
  }
}
