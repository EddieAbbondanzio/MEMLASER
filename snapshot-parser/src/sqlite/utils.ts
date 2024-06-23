import { Kysely } from "kysely";
import { Database } from "./db";

export async function getTableSize(
  db: Kysely<Database>,
  table: keyof Database,
): Promise<number> {
  const { count } = await db
    .selectFrom(table)
    .select([s => s.fn.count("id").as("count")])
    .executeTakeFirstOrThrow();
  return count as number;
}
