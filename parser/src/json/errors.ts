import { Token } from "./tokens";

export class TokenParsingError extends Error {
  constructor(message: string, tokens: Array<Token | null>) {
    const fullMessage = `${message} Tokens: [${tokens
      .map(t => (t === null ? "null" : t.name))
      .join(", ")}]`;
    super(fullMessage);
  }
}

export class InvalidJSONError extends Error {
  constructor(message: string, json: any) {
    const fullMessage = `${message} JSON: ${JSON.stringify(json)}`;
    super(fullMessage);
  }
}
