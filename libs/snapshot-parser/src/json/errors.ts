import { Token } from "./tokens.js";

export class TokenParsingError extends Error {
  constructor(message: string, tokens?: Array<Token | null>) {
    if (tokens !== undefined) {
      const fullMessage = `${message} ${tokens
        .map(t => (t === null ? "null" : t.name))
        .join(", ")}`;
      super(fullMessage);
    } else {
      super(message);
    }
  }
}

export class InvalidJSONError extends Error {
  constructor(message: string, json: unknown) {
    const fullMessage = `${message} JSON: ${JSON.stringify(json)}`;
    super(fullMessage);
  }
}
