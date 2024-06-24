import { Kysely } from "kysely";
import { Database, initializeSQLiteDB } from "../../src/sqlite/db";

export async function createInMemorySQLiteDB(): Promise<Kysely<Database>> {
  return await initializeSQLiteDB(":memory:");
}
