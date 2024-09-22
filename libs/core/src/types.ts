import * as util from "node:util";

// Just makes it easier to remember.
export interface CustomReplToString {
  [util.inspect.custom](): string;
}
