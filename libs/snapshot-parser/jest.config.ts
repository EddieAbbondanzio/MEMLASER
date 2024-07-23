import type { JestConfigWithTsJest } from "ts-jest";

// See: https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/
const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  rootDir: "test",
  moduleNameMapper: {
    "^@memlaser/database": "<rootDir>/../../database/src/index.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  extensionsToTreatAsEsm: [".ts"],
};

export default jestConfig;
