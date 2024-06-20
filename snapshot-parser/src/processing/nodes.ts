import { Kysely } from "kysely";
import { Database } from "../sqlite/db";
import { buildNodeFieldLookup, getSnapshot } from "./snapshot";

const NODE_BATCH_SIZE = 1000;

export async function processNodes(db: Kysely<Database>): Promise<void> {
  const snapshot = await getSnapshot(db);

  // Sanity check to ensure the node_data rows were generated correctly.
  const { nodeCount } = snapshot;
  const { nodeDataCount } = await db
    .selectFrom("nodeData")
    .select([s => s.fn.count("id").as("nodeDataCount")])
    .executeTakeFirstOrThrow();
  if (nodeCount !== nodeDataCount) {
    throw new Error(
      `Size of node_data table (${nodeDataCount}) doesn't match nodeCount: ${nodeCount}`,
    );
  }

  const fieldLookup = buildNodeFieldLookup(snapshot);

  const getNodeDataBatchQuery = db.selectFrom("nodeData").selectAll();
  const getNodeName = (index: number) =>
    db.selectFrom("strings").select("value").where("index", "=", index);

  for (let i = 0; i < nodeCount; i += NODE_BATCH_SIZE) {
    const currBatch = await getNodeDataBatchQuery
      .limit(Math.min(NODE_BATCH_SIZE, nodeCount - i))
      .offset(i)
      .execute();

    const nodes = [];
    for (const { index, fieldValues: rawFieldValues } of currBatch) {
      const fieldValues = JSON.parse(rawFieldValues);
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
      const type = snapshot.meta.node_types[0][nodeTypeIndex];

      nodes.push({
        index,
        type,
        name,
        nodeId: Number(fieldValues[fieldLookup["id"]]),
        selfSize: Number(fieldValues[fieldLookup["self_size"]]),
        edgeCount: Number(fieldValues[fieldLookup["edge_count"]]),
        detached: Number(fieldValues[fieldLookup["detachedness"]]),
        traceNodeId: Number(fieldValues[fieldLookup["trace_node_id"]]),
      });
    }

    await db.insertInto("nodes").values(nodes).execute();
  }
}
