import { DataSource } from "typeorm";
import { initializeSQLiteDB } from "@memlaser/database";

export async function createTestSQLiteDB(): Promise<DataSource> {
  return await initializeSQLiteDB(":memory:");
}
