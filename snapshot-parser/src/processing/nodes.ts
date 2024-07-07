import { buildNodeFieldIndices, getSnapshot } from "./snapshot.js";
import { batchSelectAll } from "../sqlite/utils.js";
import { getStringsByIndex } from "./strings.js";
import { DataSource } from "typeorm";
import { Node } from "../sqlite/entities/node.js";
import { NodeData } from "../sqlite/entities/nodeData.js";

const NODE_BATCH_SIZE = 1000;

export async function processNodes(db: DataSource): Promise<void> {
  const snapshot = await getSnapshot(db);
  const nodeTypes = snapshot.meta.node_types[0];
  const fieldIndices = buildNodeFieldIndices(snapshot);

  // Sanity check to ensure the node_data rows were generated correctly.
  const { nodeCount } = snapshot;
  const nodeDataCount = await db
    .createQueryBuilder()
    .select("*")
    .from(NodeData, "node_data")
    .getCount();
  if (nodeCount !== nodeDataCount) {
    throw new Error(
      `Size of node_data table (${nodeDataCount}) doesn't match nodeCount: ${nodeCount}`,
    );
  }

  for await (const nodeData of batchSelectAll<NodeData>(
    db,
    NodeData,
    "id",
    NODE_BATCH_SIZE,
  )) {
    const nameLookup = await getStringsByIndex(
      db,
      nodeData.map(n => n.fieldValues[fieldIndices["name"]]),
    );

    const nodes = nodeData.map(({ index, fieldValues }) => ({
      index,
      type: nodeTypes[fieldValues[fieldIndices["type"]]],
      name: nameLookup[fieldValues[fieldIndices["name"]]].value,
      nodeId: fieldValues[fieldIndices["id"]],
      selfSize: fieldValues[fieldIndices["self_size"]],
      edgeCount: fieldValues[fieldIndices["edge_count"]],
      detached: Boolean(fieldValues[fieldIndices["detachedness"]]),
      traceNodeId: fieldValues[fieldIndices["trace_node_id"]],
    }));

    await db.createQueryBuilder().insert().into(Node).values(nodes).execute();
  }
}
