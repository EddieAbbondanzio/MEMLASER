import { TokenQueue } from "../../src/json/tokenQueue.js";
import { Token } from "../../src/json/tokens.js";
import { chain } from "stream-chain";
import * as fs from "fs";
import { parser } from "stream-json";

// Pass a path to read a JSON file, pass a token array to simulate one.
export async function createTokenQueue(path: string): Promise<TokenQueue>;
export async function createTokenQueue(
  tokens: Token[],
  opts: { isDraining: boolean },
): Promise<TokenQueue>;
export async function createTokenQueue(
  pathOrTokens: string | Token[],
  opts?: { isDraining: boolean },
): Promise<TokenQueue> {
  const tokenQueue = new TokenQueue();

  if (typeof pathOrTokens === "string") {
    const pipeline = chain([
      fs.createReadStream(pathOrTokens),
      parser({ packKeys: false, packStrings: false, packNumbers: false }),
      token => tokenQueue.onToken(token),
    ]);

    pipeline.on("end", () => tokenQueue.setIsDraining());
  } else {
    for (const token of pathOrTokens) {
      tokenQueue.onToken(token);
    }

    if (opts?.isDraining) {
      tokenQueue.setIsDraining();
    }
  }

  return tokenQueue;
}