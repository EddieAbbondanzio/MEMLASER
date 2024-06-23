import { Kysely } from "kysely";
import { Dictionary, keyBy } from "lodash";
import { Database } from "src/sqlite/db";
import {
  EdgeFieldLookup,
  Snapshot,
  buildEdgeFieldLookup,
  getSnapshot,
} from "./snapshot";
import { getTableSize } from "../sqlite/utils";

const EDGE_BATCH_SIZE = 1000;

export async function processEdges(db: Kysely<Database>): Promise<void> {
  const snapshot = await getSnapshot(db);
  const _fieldLookup = buildEdgeFieldLookup(snapshot);

  for await (const _currBatch of batchSelectEdgeData(
    db,
    snapshot,
    EDGE_BATCH_SIZE,
  )) {
    // const nameLookup = await getStringsByIndex(
    //   db,
    //   currBatch
    //     .map(e => e.fieldValues[fieldLookup["name_or_index"]])
    //     .filter(nameOrIndex => typeof nameOrIndex === "number"),
    // );
    // let name
    // const edges = currBatch.map(({ index, fieldValues }) => ({
    //   index,
    //   name,
    //   type: snapshot.meta.edge_types[0][fieldValues[fieldLookup["type"]]],
    // }));
    // await db.insertInto("edges").values(edges).execute();
  }
}

interface EdgeData {
  id: number;
  index: number;
  fieldValues: number[];
}

export async function buildEdgeNameLookup(
  db: Kysely<Database>,
  fieldLookup: EdgeFieldLookup,
  edges: EdgeData[],
): Promise<Dictionary<{ index: number; value: string }>> {
  const indices = edges
    .map(e => e.fieldValues[fieldLookup["name_or_index"]])
    .filter(nameOrIndex => typeof nameOrIndex === "number");

  const names = await db
    .selectFrom("strings")
    .select(["index", "value"])
    .where("index", "in", indices)
    .execute();
  return keyBy(names, n => n.index);
}

interface EdgeData {
  id: number;
  index: number;
  fieldValues: number[];
}

async function* batchSelectEdgeData(
  db: Kysely<Database>,
  snapshot: Snapshot,
  batchSize: number,
): AsyncGenerator<EdgeData[], void, void> {
  // Sanity check to ensure the edge_data rows were generated correctly.
  const { edgeCount } = snapshot;
  const edgeDataCount = await getTableSize(db, "edgeData");
  if (edgeCount !== edgeDataCount) {
    throw new Error(
      `Size of edge_data table (${edgeDataCount}) doesn't match edgeCount: ${edgeCount}`,
    );
  }

  const getEdgeDataBatchQuery = db.selectFrom("edgeData").selectAll();
  for (let i = 0; i < edgeCount; i += batchSize) {
    const rawNodeData = await getEdgeDataBatchQuery
      .limit(Math.min(batchSize, edgeCount - i))
      .offset(i)
      .execute();

    const nodeData = rawNodeData.map(raw => ({
      ...raw,
      fieldValues: JSON.parse(raw.fieldValues),
    }));

    yield nodeData;
  }
}
