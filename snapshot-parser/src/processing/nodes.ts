import { Kysely } from "kysely";
import { Database } from "../sqlite/db";
import { Snapshot, buildNodeFieldLookup, getSnapshot } from "./snapshot";

const NODE_BATCH_SIZE = 1000;

export async function processNodes(db: Kysely<Database>): Promise<void> {
  const snapshot = await getSnapshot(db);
  const fieldLookup = buildNodeFieldLookup(snapshot);

  const getNodeName = (index: number) =>
    db.selectFrom("strings").select("value").where("index", "=", index);

  for await (const currBatch of batchSelectAllNodeData(
    db,
    snapshot,
    NODE_BATCH_SIZE,
  )) {
    const nodes = [];
    for (const { index, fieldValues } of currBatch) {
      // N.B. Name field value can be a number or string. When it's a string,
      // it's the actual node name, but when it is a number we have to look up
      // the name from the strings table.
      const nameFieldValue = fieldValues[fieldLookup["name"]];
      let name;
      if (typeof nameFieldValue === "string") {
        name = nameFieldValue;
      } else {
        name = (await getNodeName(nameFieldValue).executeTakeFirstOrThrow())
          .value;
      }

      const nodeTypeIndex = fieldValues[fieldLookup["type"]];
      const type = snapshot.meta.node_types[0][nodeTypeIndex as number];

      nodes.push({
        index,
        type,
        name,
        nodeId: fieldValues[fieldLookup["id"]] as number,
        selfSize: fieldValues[fieldLookup["self_size"]] as number,
        edgeCount: fieldValues[fieldLookup["edge_count"]] as number,
        detached: fieldValues[fieldLookup["detachedness"]] as number,
        traceNodeId: fieldValues[fieldLookup["trace_node_id"]] as number,
      });
    }

    await db.insertInto("nodes").values(nodes).execute();
  }
}

interface NodeData {
  id: number;
  index: number;
  // Only name is actually number | string, but there's no easy way to improve
  // this type so we role with the union.
  fieldValues: Array<number | string>;
}

async function* batchSelectAllNodeData(
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
  const { nodeDataCount } = await db
    .selectFrom("nodeData")
    .select([s => s.fn.count("id").as("nodeDataCount")])
    .executeTakeFirstOrThrow();
  return nodeDataCount as number;
}
