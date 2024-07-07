import { Kysely } from "kysely";
import { Database, initializeSQLite } from "../../src/sqlite/db";

export async function createTestSQLiteDB(): Promise<Kysely<Database>> {
  return await initializeSQLite(":memory:");
}
