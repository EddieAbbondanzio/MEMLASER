import { Kysely } from "kysely";
import { Database } from "./db";
import { AllSelection } from "kysely/dist/cjs/parser/select-parser";
import { From } from "kysely/dist/cjs/parser/table-parser";

// Helper to get the model def from a Kysely table.
export type Model<T extends keyof Database> = AllSelection<
  From<Database, T>,
  T
>;

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

export async function* batchSelectTable<T extends keyof Database>(
  db: Kysely<Database>,
  table: T,
  batchSize: number,
): AsyncGenerator<Model<T>, void, void> {
  const count = await getTableSize(db, table);
  const selectQuery = db.selectFrom(table).selectAll();
  for (let i = 0; i < count; i += batchSize) {
    const rows = await selectQuery
      .limit(Math.min(batchSize, count - i))
      .offset(i)
      .execute();

    yield rows as unknown as Model<T>[];
  }
}
