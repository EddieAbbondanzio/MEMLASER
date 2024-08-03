import envPaths from "env-paths";

export const APP_NAME = "memlaser";

export const NODE_ENV: NodeEnv = process.env.NODE_ENV! as NodeEnv;
type NodeEnv = "development" | "test" | "production";

export let DATA_DIR: string;
switch (NODE_ENV) {
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
