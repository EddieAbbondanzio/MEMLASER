import type { JestConfigWithTsJest } from "ts-jest";

// See: https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/
const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  rootDir: "test",
  moduleNameMapper: {
    "^@memlaser/database": "<rootDir>/../../database/src/index.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process ts,js,tsx,jsx with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process ts,js,tsx,jsx,mts,mjs,mtsx,mjsx with `ts-jest`
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
};

export default jestConfig;
