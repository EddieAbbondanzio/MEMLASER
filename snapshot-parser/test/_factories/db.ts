import { Kysely } from "kysely";
import { Database, initializeSQLiteDB } from "../../src/sqlite/db";

export async function createTestSQLiteDB(): Promise<Kysely<Database>> {
  return await initializeSQLiteDB(":memory:");
}
