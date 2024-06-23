import { Kysely } from "kysely";
import { Database } from "../sqlite/db";
import { Snapshot, buildNodeFieldLookup, getSnapshot } from "./snapshot";
import { getTableSize } from "../sqlite/utils";
import { getStringsByIndex } from "./strings";

const NODE_BATCH_SIZE = 1000;

export async function processNodes(db: Kysely<Database>): Promise<void> {
  const snapshot = await getSnapshot(db);
  const fieldLookup = buildNodeFieldLookup(snapshot);

  for await (const currBatch of batchSelectNodeData(
    db,
    snapshot,
    NODE_BATCH_SIZE,
  )) {
    const nameLookup = await getStringsByIndex(
      db,
      currBatch.map(n => n.fieldValues[fieldLookup["name"]]),
    );

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
  const nodeDataCount = await getTableSize(db, "nodeData");
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
