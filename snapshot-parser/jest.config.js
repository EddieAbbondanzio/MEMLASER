/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "test",
  testMatch: ["**/*.test.ts"],
  passWithNoTests: false,
};
