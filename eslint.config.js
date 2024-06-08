/* eslint-disable  */
// N.B. eslint doesn't support ESM syntax if we haven't specified
// "type"; "module" in package.json so we write it as commonjs for now.
// Followed this guide: https://typescript-eslint.io/getting-started/
// @ts-check

const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["*/dist/*", "*/jest.config.js", "*/eslint.config.js"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
);
