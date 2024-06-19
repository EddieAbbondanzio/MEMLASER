import { Kysely } from "kysely";
import { Database } from "../sqlite/db";
import { getSnapshot } from "../sqlite/utils";

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

  const { node_fields: nodeFields } = snapshot.meta;
  const typeIndex = nodeFields.findIndex(f => f === "type");
  const nameIndex = nodeFields.findIndex(f => f === "name");
  const nodeIdIndex = nodeFields.findIndex(f => f === "id");
  const selfSizeIndex = nodeFields.findIndex(f => f === "self_size");
  const edgeCountIndex = nodeFields.findIndex(f => f === "edge_count");
  const detachednessIndex = nodeFields.findIndex(f => f === "detachedness");
  const traceNodeIdIndex = nodeFields.findIndex(f => f === "trace_node_id");

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
      const nameFieldValue = fieldValues[nameIndex];
      let name;
      if (typeof nameFieldValue === "string") {
        name = nameFieldValue;
      } else {
        name = (await getNodeName(nameFieldValue).executeTakeFirstOrThrow())
          .value;
      }

      nodes.push({
        index,
        type: fieldValues[typeIndex],
        name,
        nodeId: Number(fieldValues[nodeIdIndex]),
        selfSize: Number(fieldValues[selfSizeIndex]),
        edgeCount: Number(fieldValues[edgeCountIndex]),
        detached: Number(fieldValues[detachednessIndex]),
        traceNodeId: Number(fieldValues[traceNodeIdIndex]),
      });
    }

    // console.log(nodes);
    await db.insertInto("nodes").values(nodes).execute();
  }
}
