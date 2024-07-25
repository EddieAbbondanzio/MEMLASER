import envPaths from "env-paths";

export const APP_NAME = "memlaser";

export let DATA_DIR: string;
switch (process.env.NODE_ENV) {
  case "production":
    {
      const osPaths = envPaths(APP_NAME, { suffix: "" });
      DATA_DIR = osPaths.data;
    }
    break;

  case "development":
    DATA_DIR = "../../data-directory";
    break;

  case "test":
    DATA_DIR = "/data-directory";
    break;

  default:
    throw new Error(`Unexpected NODE_ENV: ${process.env.NODE_ENV}`);
}

export const HTTP_PORT = 3475;
