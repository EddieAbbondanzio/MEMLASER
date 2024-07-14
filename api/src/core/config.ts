import envPaths from "env-paths";

export const APP_NAME = "memlaser";

export let DATA_DIR = "data-directory";
const osPaths = envPaths(APP_NAME, { suffix: "" });
if (process.env.NODE_ENV === "production") {
  DATA_DIR = osPaths.data;
}

export const HTTP_PORT = 3475;
export const WEBSOCKET_PORT = 3476;