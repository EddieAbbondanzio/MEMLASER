import { DataSource } from "typeorm";
import { initializeSQLite } from "../../src/sqlite/utils.js";

export async function createTestSQLiteDB(): Promise<DataSource> {
  return await initializeSQLite(":memory:");
}
