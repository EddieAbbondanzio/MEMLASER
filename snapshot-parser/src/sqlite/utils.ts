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

export async function* batchSelectAll<T extends keyof Database & string>(
  db: Kysely<Database>,
  table: T,
  orderBy: keyof Model<T>,
  batchSize: number,
): AsyncGenerator<Model<T>[], void, void> {
  // Repeat batches until we get a batch smaller than batchSize. That means
  // we are done!

  let offset = 0;
  while (true) {
    const rows = await db
      .selectFrom(table)
      .selectAll()
      .limit(batchSize)
      .offset(offset)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .orderBy(orderBy as any)
      .execute();
    offset += batchSize;

    yield rows as Model<T>[];
    // If the last batch we got was smaller than the batchSize, it means that
    // that it was the last batch and we can stop.
    if (rows.length < batchSize) {
      return;
    }
  }
}
