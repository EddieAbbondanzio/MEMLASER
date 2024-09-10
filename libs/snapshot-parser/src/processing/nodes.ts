import {
  Node,
  NodeData,
  NodeType,
  batchSelectAll,
  isPrimitive,
} from "@memlaser/database";
import { buildNodeFieldIndices, getSnapshot } from "./snapshot.js";
import { getStringsByIndex } from "./strings.js";
import { DataSource } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";

const NODE_BATCH_SIZE = 1000;

export async function processNodes(db: DataSource): Promise<void> {
  const snapshot = await getSnapshot(db);
  const nodeTypes = snapshot.meta.nodeTypes[0];
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

    const nodes: QueryDeepPartialEntity<Node>[] = [];
    for (const { index, fieldValues } of nodeData) {
      const type = nodeTypes[fieldValues[fieldIndices["type"]]] as NodeType;
      const name = nameLookup[fieldValues[fieldIndices["name"]]].value;
      const nodeId = fieldValues[fieldIndices["id"]];
      const shallowSize = fieldValues[fieldIndices["self_size"]];
      const edgeCount = fieldValues[fieldIndices["edge_count"]];
      const detached = Boolean(fieldValues[fieldIndices["detachedness"]]);
      const traceNodeId = fieldValues[fieldIndices["trace_node_id"]];

      if (shallowSize == null) {
        throw new Error(`Shallow size cannot be null for node ID: ${nodeId}`);
      }
      let retainedSize = null;

      // Primitives that don't hold references will have a retained size
      // equivalent to their shallow size. Ex: number, string.
      if (isPrimitive(type)) {
        retainedSize = shallowSize;
      } else {
        // We can't calculate retained size for objects that have references
        // until we've loaded in all the other nodes first.
      }

      nodes.push({
        index,
        type,
        name,
        nodeId,
        shallowSize,
        retainedSize,
        edgeCount,
        detached,
        traceNodeId,
      });

      console.log(nodes[nodes.length - 1]);
    }

    await db.createQueryBuilder().insert().into(Node).values(nodes).execute();
  }
}
