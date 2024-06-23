import { Kysely, SelectQueryBuilder } from "kysely";
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

// Only works with selectAll()
export async function* batchSelect<T extends keyof Database>(
  query: SelectQueryBuilder<Database, T, Model<T>>,
  batchSize: number,
): AsyncGenerator<Model<T>[], void, void> {
  // Repeat batches until we get a batch smaller than batchSize. That means
  // we are done!

  let offset = 0;
  while (true) {
    const rows = await query.limit(batchSize).offset(offset).execute();
    offset += batchSize;

    yield rows as Model<T>[];
    // If the last batch we got was smaller than the batchSize, it means that
    // that it was the last batch and we can stop.
    if (rows.length < batchSize) {
      return;
    }
  }
}
