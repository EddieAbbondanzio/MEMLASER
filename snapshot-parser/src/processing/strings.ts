import { Kysely } from "kysely";
import { Database } from "../sqlite/db";
import { Dictionary, keyBy } from "lodash";

export async function getStringsByIndex(
  db: Kysely<Database>,
  indices: number[],
): Promise<Dictionary<{ index: number; value: string }>> {
  const strings = await db
    .selectFrom("strings")
    .select(["index", "value"])
    .where("index", "in", indices)
    .execute();

  return keyBy(strings, s => s.index);
}
