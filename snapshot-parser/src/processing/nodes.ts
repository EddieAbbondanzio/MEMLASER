import { Kysely } from "kysely";
import { Database } from "../sqlite/db";
import {
  NodeFieldLookup,
  Snapshot,
  buildNodeFieldLookup,
  getSnapshot,
} from "./snapshot";
import { Dictionary, keyBy } from "lodash";

const NODE_BATCH_SIZE = 1000;

export async function processNodes(db: Kysely<Database>): Promise<void> {
  const snapshot = await getSnapshot(db);
  const fieldLookup = buildNodeFieldLookup(snapshot);

  for await (const currBatch of batchSelectNodeData(
    db,
    snapshot,
    NODE_BATCH_SIZE,
  )) {
    const nameLookup = await buildNodeNameLookup(db, fieldLookup, currBatch);

    const nodes = currBatch.map(({ index, fieldValues }) => ({
      index,
      type: snapshot.meta.node_types[0][fieldValues[fieldLookup["type"]]],
      name: nameLookup[fieldValues[fieldLookup["name"]]].value,
      nodeId: fieldValues[fieldLookup["id"]],
      selfSize: fieldValues[fieldLookup["self_size"]],
      edgeCount: fieldValues[fieldLookup["edge_count"]],
      detached: fieldValues[fieldLookup["detachedness"]],
      traceNodeId: fieldValues[fieldLookup["trace_node_id"]],
    }));
    await db.insertInto("nodes").values(nodes).execute();
  }
}

interface NodeData {
  id: number;
  index: number;
  fieldValues: number[];
}

async function* batchSelectNodeData(
  db: Kysely<Database>,
  snapshot: Snapshot,
  batchSize: number,
): AsyncGenerator<NodeData[], void, void> {
  // Sanity check to ensure the node_data rows were generated correctly.
  const { nodeCount } = snapshot;
  const nodeDataCount = await getNodeDataCount(db);
  if (nodeCount !== nodeDataCount) {
    throw new Error(
      `Size of node_data table (${nodeDataCount}) doesn't match nodeCount: ${nodeCount}`,
    );
  }

  const getNodeDataBatchQuery = db.selectFrom("nodeData").selectAll();
  for (let i = 0; i < nodeCount; i += batchSize) {
    const rawNodeData = await getNodeDataBatchQuery
      .limit(Math.min(batchSize, nodeCount - i))
      .offset(i)
      .execute();

    const nodeData = rawNodeData.map(raw => ({
      ...raw,
      fieldValues: JSON.parse(raw.fieldValues),
    }));

    yield nodeData;
  }
}

async function getNodeDataCount(db: Kysely<Database>): Promise<number> {
  const { count } = await db
    .selectFrom("nodeData")
    .select([s => s.fn.count("id").as("count")])
    .executeTakeFirstOrThrow();
  return count as number;
}

async function buildNodeNameLookup(
  db: Kysely<Database>,
  fieldLookup: NodeFieldLookup,
  nodes: NodeData[],
): Promise<Dictionary<{ index: number; value: string }>> {
  const names = await db
    .selectFrom("strings")
    .select(["index", "value"])
    .where(
      "index",
      "in",
      nodes.map(n => n.fieldValues[fieldLookup["name"]]),
    )
    .execute();
  return keyBy(names, n => n.index);
}
