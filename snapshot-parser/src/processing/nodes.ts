import { Kysely } from "kysely";
import { Database } from "../sqlite/db";
import { buildNodeFieldIndices, getSnapshot } from "./snapshot";
import { batchSelectAll, getTableSize } from "../sqlite/utils";
import { getStringsByIndex } from "./strings";

const NODE_BATCH_SIZE = 1000;

export async function processNodes(db: Kysely<Database>): Promise<void> {
  const snapshot = await getSnapshot(db);
  const nodeTypes = snapshot.meta.node_types[0];
  const fieldIndices = buildNodeFieldIndices(snapshot);

  // Sanity check to ensure the node_data rows were generated correctly.
  const { nodeCount } = snapshot;
  const nodeDataCount = await getTableSize(db, "nodeData");
  if (nodeCount !== nodeDataCount) {
    throw new Error(
      `Size of node_data table (${nodeDataCount}) doesn't match nodeCount: ${nodeCount}`,
    );
  }

  for await (const nodeData of batchSelectAll(
    db,
    "nodeData",
    "id",
    NODE_BATCH_SIZE,
  )) {
    const batch = nodeData.map(raw => ({
      ...raw,
      fieldValues: JSON.parse(raw.fieldValues),
    }));
    const nameLookup = await getStringsByIndex(
      db,
      batch.map(n => n.fieldValues[fieldIndices["name"]]),
    );

    const nodes = batch.map(({ index, fieldValues }) => ({
      index,
      type: nodeTypes[fieldValues[fieldIndices["type"]]],
      name: nameLookup[fieldValues[fieldIndices["name"]]].value,
      nodeId: fieldValues[fieldIndices["id"]],
      selfSize: fieldValues[fieldIndices["self_size"]],
      edgeCount: fieldValues[fieldIndices["edge_count"]],
      detached: fieldValues[fieldIndices["detachedness"]],
      traceNodeId: fieldValues[fieldIndices["trace_node_id"]],
    }));
    await db.insertInto("nodes").values(nodes).execute();
  }
}
