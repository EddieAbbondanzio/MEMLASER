import EventEmitter from "events";
import { Token } from "./tokens";

export class TokenQueue {
  #isDraining: boolean;
  #tokenCache: Token[];
  #eventEmitter: EventEmitter;

  constructor() {
    this.#isDraining = false;
    this.#tokenCache = [];
    this.#eventEmitter = new EventEmitter();
  }

  async onToken(token: Token): Promise<void> {
    this.#tokenCache.push(token);
    this.#eventEmitter.emit("token", token);
  }

  async peek(): Promise<Token | null> {
    if (this.isEmpty()) {
      return null;
    }

    // Wait for a token to come in if there's nothing in the cache.
    if (this.#tokenCache.length === 0) {
      await new Promise(res => {
        this.#eventEmitter.once("token", res);
      });
    }

    return this.#tokenCache[0]!;
  }

  async take(): Promise<Token | null> {
    if (this.isEmpty()) {
      console.log("Queue is empty! Return null.");
      return null;
    }

    // Wait for a token to come in if there's nothing in the cache.
    if (this.#tokenCache.length === 0) {
      await new Promise(res => {
        this.#eventEmitter.once("token", res);
      });
    }

    return this.#tokenCache.shift()!;
  }

  async takeUntil(until: (t: Token) => boolean): Promise<Token[]> {
    const tokens: Token[] = [];

    while (!this.isEmpty()) {
      let next = (await this.peek())!;
      if (until(next)) {
        tokens.push((await this.take())!);
        break;
      }

      tokens.push((await this.take())!);
    }

    return tokens;
  }

  isEmpty(): boolean {
    if (this.#isDraining) {
      return this.#tokenCache.length === 0;
    }

    return false;
  }

  setIsDraining(): void {
    if (this.#isDraining) {
      throw new Error("Cannot mark draining token queue as draining.");
    }

    this.#isDraining = true;
  }
}