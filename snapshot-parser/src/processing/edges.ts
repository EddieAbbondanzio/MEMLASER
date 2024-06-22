import { Kysely } from "kysely";
import { Dictionary, keyBy } from "lodash";
import { EdgeFieldJSON } from "src/json/schema";
import { Database } from "src/sqlite/db";

const EDGE_BATCH_SIZE = 1000;

export async function processEdges(db: Kysely<Database>): Promise<void> {}

interface EdgeData {
  id: number;
  index: number;
  fieldValues: number[];
}

// TODO: Make a generic getTableSize and use it here / node file
export async function getEdgeDataCount(db: Kysely<Database>): Promise<number> {
  const { count } = await db
    .selectFrom("edgeData")
    .select([(s) => s.fn.count("id").as("count")])
    .executeTakeFirstOrThrow();
  return count as number;
}

// TODO: Create a getStringsByIndex(db, indices: number[]) and use it here / node file.
export type EdgeFieldLookup = Record<EdgeFieldJSON, number>;
export async function buildEdgeNameLookup(
  db: Kysely<Database>,
  fieldLookup: EdgeFieldLookup,
  edges: EdgeData[]
): Promise<Dictionary<{ index: number; value: string }>> {
  const indices = edges
    .map((e) => e.fieldValues[fieldLookup["name_or_index"]])
    .filter((nameOrIndex) => typeof nameOrIndex === "number");

  const names = await db
    .selectFrom("strings")
    .select(["index", "value"])
    .where("index", "in", indices)
    .execute();
  return keyBy(names, (n) => n.index);
}
