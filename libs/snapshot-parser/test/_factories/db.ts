import { DataSource } from "typeorm";
import { SQLITE_IN_MEMORY, initializeSQLiteDB } from "@memlaser/database";

export async function createTestSQLiteDB(): Promise<DataSource> {
  return await initializeSQLiteDB(SQLITE_IN_MEMORY);
}
