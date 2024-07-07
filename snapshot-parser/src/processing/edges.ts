import { batchSelectAll } from "../sqlite/utils";
import { buildEdgeFieldIndices, getSnapshot } from "./snapshot";
import { getStringsByIndex } from "./strings";
import { chunk, keyBy } from "lodash";
import { Node } from "../sqlite/entities/node";
import { EdgeData } from "../sqlite/entities/edgeData";
import { DataSource } from "typeorm";
import { Edge } from "../sqlite/entities/edge";

const NODE_BATCH_SIZE = 1000;
const EDGE_DATA_BATCH_SIZE = 1000;

// Sqlite has an upper bound on the number of query parameters allowed, so
// we have to chunk the insert to avoid a `SqliteError: too many SQL
// variables` error from being thrown.
//
// The limit (SQLITE_LIMIT_VARIABLE_NUMBER) is currently 32766.
// 32766 / numOfEdgeColumns (5) = 6553 edges MAX.
const EDGE_INSERT_BATCH_SIZE = 5000;

interface EdgeProcessingData {
  edgeIndex: number;
  fieldValues: Array<string | number>;
  fromNodeId: number;
  name?: string;
  toNodeId?: number;
}

export async function processEdges(db: DataSource): Promise<void> {
  const snapshot = await getSnapshot(db);
  const edgeTypes = snapshot.meta.edge_types[0];
  const fieldIndices = buildEdgeFieldIndices(snapshot);
  const edgeDataLoader = await createEdgeDataLoader(db);

  for await (const nodeBatch of batchSelectAll<Node>(
    db,
    Node,
    "index",
    NODE_BATCH_SIZE,
  )) {
    const edgeProcessingData: EdgeProcessingData[] = [];

    // Map edge data to their parent node.
    for (const node of nodeBatch) {
      const { edgeCount } = node;
      const edgeData = await edgeDataLoader.getNext(edgeCount);
      for (const edge of edgeData) {
        edgeProcessingData.push({
          edgeIndex: edge.index,
          fieldValues: JSON.parse(edge.fieldValues),
          fromNodeId: node.id,
        });
      }
    }

    // Find the names of the edges.
    const nameLookup = await getStringsByIndex(
      db,
      edgeProcessingData
        .map(e => e.fieldValues[fieldIndices["name_or_index"]])
        .filter(e => typeof e === "number") as number[],
    );
    for (const edge of edgeProcessingData) {
      const nameOrIndex = edge.fieldValues[fieldIndices["name_or_index"]];
      if (typeof nameOrIndex === "string") {
        edge.name = nameOrIndex;
      } else {
        edge.name = nameLookup[nameOrIndex].value;
      }
    }

    // Build map of node indices to ids for to_node
    const nodeIndices = edgeProcessingData.map(
      e => e.fieldValues[fieldIndices["to_node"]],
    ) as number[];
    const nodeIds = await db
      .createQueryBuilder()
      .select()
      .from(Node, "node")
      .select(["id", "index"])
      .where("index IN (:...nodeIndices)", nodeIndices)
      .execute();
    const nodesByIndex = keyBy(nodeIds, obj => obj.index);

    for (const edge of edgeProcessingData) {
      const toNodeIndex = edge.fieldValues[fieldIndices["to_node"]];
      edge.toNodeId = nodesByIndex[toNodeIndex].id;
    }

    // Build the actual edges.
    const edges = [];
    for (const e of edgeProcessingData) {
      if (e.name === undefined) {
        throw new Error(`Edge (index: ${e.edgeIndex}) is missing a name.`);
      }
      if (e.toNodeId === undefined) {
        throw new Error(`Edge (index: ${e.edgeIndex}) is missing a to node.`);
      }

      edges.push({
        index: e.edgeIndex,
        type: edgeTypes[e.fieldValues[fieldIndices["type"]] as number],
        name: e.name,
        toNodeId: e.toNodeId,
        fromNodeId: e.fromNodeId,
      });
    }

    const chunks = chunk(edges, EDGE_INSERT_BATCH_SIZE);
    for (const chunk of chunks) {
      await db.createQueryBuilder().insert().into(Edge).values(chunk).execute();
    }
  }
}

export async function createEdgeDataLoader(
  db: DataSource,
  batchSize = EDGE_DATA_BATCH_SIZE,
): Promise<{
  getNext(count: number): Promise<EdgeData[]>;
}> {
  const iterator = batchSelectAll<EdgeData>(db, EdgeData, "index", batchSize);
  const cache: EdgeData[] = [];
  let isDraining = false;

  return {
    async getNext(count: number): Promise<EdgeData[]> {
      while (!isDraining && cache.length < count) {
        const result = await iterator.next();
        if (result.done) {
          isDraining = true;
        } else {
          cache.push(...result.value);
        }
      }

      const edges = cache.splice(0, count);
      if (edges.length < count) {
        throw new Error(
          `Cannot get next ${count} edges. Only ${edges.length} left.`,
        );
      }
      return edges;
    },
  };
}
