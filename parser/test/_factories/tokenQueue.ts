import { TokenQueue } from "../../src/json/tokenQueue";
import { Token } from "../../src/json/tokens";

export function createTokenQueue(
  tokens: Token[],
  opts: { isDraining: boolean },
): TokenQueue {
  const tq = new TokenQueue();
  for (const token of tokens) {
    tq.onToken(token);
  }

  if (opts.isDraining) {
    tq.setIsDraining();
  }

  return tq;
}
