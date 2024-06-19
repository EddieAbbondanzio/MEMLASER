import { parseSnapshotFile } from "./json/parser";
import { EdgeJSON, NodeJSON, SnapshotJSON  } from "./json/schema";
import { processNodes } from "./processing/nodes";
import { Kysely } from "kysely";
import { Database, initializeSQLiteDB } from "./sqlite/db";

async function main(): Promise<void> {
  console.log("main()");
  const db = await parseSnapshotToSQLite({
    snapshotPath: "samples/reddit.heapsnapshot",
    outputPath: "out/reddit.sqlite",
  });
  // const db = await loadSQLiteDB("samples/reddit.sqlite");
  await processNodes(db);
  console.log("-- Done!");
}
void main();

interface ParseSnapshotToSQLiteOptions {
  snapshotPath: string;
  outputPath: string;
}

export async function parseSnapshotToSQLite(
  options: ParseSnapshotToSQLiteOptions,
): Promise<Kysely<Database>> {
  const { snapshotPath, outputPath } = options;
  const db = await initializeSQLiteDB(outputPath);

  const onSnapshot = async (snapshot: SnapshotJSON): Promise<void> => {
    await db
      .insertInto("snapshots")
      .values({
        meta: JSON.stringify(snapshot.meta),
        nodeCount: snapshot.node_count,
        edgeCount: snapshot.edge_count,
        traceFunctionCount: snapshot.trace_function_count,
      })
      .executeTakeFirst();
  };

  const onNodeBatch = async (
    nodes: NodeJSON[],
    offset: number,
  ): Promise<void> => {
    await db
      .insertInto("nodeData")
      .values(
        nodes.map((n, i) => ({
          index: offset + i,
          fieldValues: JSON.stringify(n),
        })),
      )
      .execute();
  };

  const onEdgeBatch = async (
    edges: EdgeJSON[],
    offset: number,
  ): Promise<void> => {
    await db
      .insertInto("edgeData")
      .values(
        edges.map((e, i) => ({
          index: offset + i,
          fieldValues: JSON.stringify(e),
        })),
      )
      .execute();
  };

  const onStringBatch = async (
    strings: string[],
    offset: number,
  ): Promise<void> => {
    await db
      .insertInto("strings")
      .values(
        strings.map((s, i) => ({
          index: offset + i,
          value: s,
        })),
      )
      .execute();
  };

  await parseSnapshotFile(snapshotPath, {
    onSnapshot,
    onNodeBatch,
    onEdgeBatch,
    onStringBatch,
  });

  return db;
}
