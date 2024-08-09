// Needed by TypeORM.
import "reflect-metadata";
import { parseSnapshotFile } from "./json/parser.js";
import { EdgeJSON, NodeJSON, SnapshotJSON } from "./json/schema.js";
import { processNodes } from "./processing/nodes.js";
import {
  initializeSQLiteDB,
  HeapString,
  Snapshot,
  NodeData,
  EdgeData,
  SnapshotStats,
} from "@memlaser/database";
import { processEdges } from "./processing/edges.js";
import * as fs from "fs";
import { DataSource } from "typeorm";

// TODO: Move this to a debug function for testing
// async function main(): Promise<void> {
//   console.log("main()");
//   await parseSnapshotToSQLite({
//     snapshotPath: "samples/foo-bar.heapsnapshot",
//     outputPath: "out/foo-bar.sqlite",
//     overwriteExisting: true,
//     logger: console.log,
//   });
//   console.log("-- done!");
// }
// void main();

interface ParseSnapshotToSQLiteOptions {
  snapshotPath: string;
  outputPath: string;
  overwriteExisting?: boolean;
  logger?: (message: string) => void;
}

export async function parseSnapshotToSQLite(
  options: ParseSnapshotToSQLiteOptions,
): Promise<DataSource> {
  const { snapshotPath, outputPath, overwriteExisting, logger } = options;

  if (fs.existsSync(outputPath)) {
    if (!overwriteExisting) {
      throw new Error(
        `Output file: ${outputPath} already exists. Please pass overWritingExisting: true if you want it to be updated.`,
      );
    } else {
      console.warn(`Overwriting existing file: ${outputPath}`);
      await fs.promises.rm(outputPath);
    }
  }

  logger?.("Beginning import of snapshot");
  const db = await initializeSQLiteDB(outputPath);
  const snapshotStats = fs.statSync(snapshotPath);
  await db
    .createQueryBuilder()
    .insert()
    .into(SnapshotStats)
    .values({
      fileSize: snapshotStats.size,
      createdAt: snapshotStats.birthtime,
      importedAt: new Date(),
    })
    .execute();
  logger?.("Snapshot stats saved");

  // Snapshot will always be read before anything else so it's safe to use these
  // variables in other callbacks such as onNodeBatch, onEdgeBatch.
  let nodeFieldCount = 0;
  let edgeFieldCount = 0;

  const onSnapshot = async (json: SnapshotJSON): Promise<void> => {
    nodeFieldCount = json.meta.node_fields.length;
    edgeFieldCount = json.meta.edge_fields.length;

    await db
      .createQueryBuilder()
      .insert()
      .into(Snapshot)
      .values({
        meta: {
          nodeFields: json.meta.node_fields,
          nodeTypes: json.meta.node_types,
          edgeFields: json.meta.edge_fields,
          edgeTypes: json.meta.edge_types,
          traceFunctionInfoFields: json.meta.trace_function_info_fields,
          traceNodeFields: json.meta.trace_node_fields,
          sampleFields: json.meta.sample_fields,
          locationFields: json.meta.location_fields,
        },
        edgeCount: json.edge_count,
        nodeCount: json.node_count,
        traceFunctionCount: json.trace_function_count,
      })
      .execute();
    logger?.("Snapshot metadata saved");
  };

  const onNodeBatch = async (
    nodes: NodeJSON[],
    offset: number,
    total: number,
  ): Promise<void> => {
    await db
      .createQueryBuilder()
      .insert()
      .into(NodeData)
      .values(
        nodes.map((n, i) => ({
          // Since nodes store field values in a flat array we have to multiply
          // i by the number of fields to ensure it points to the first field of
          // the node.
          index: offset + i * nodeFieldCount,
          fieldValues: n,
        })),
      )
      .execute();
    logger?.(
      `${(offset / nodeFieldCount).toLocaleString()} nodes of ${total.toLocaleString()} saved`,
    );
  };

  const onEdgeBatch = async (
    edges: EdgeJSON[],
    offset: number,
    total: number,
  ): Promise<void> => {
    await db
      .createQueryBuilder()
      .insert()
      .into(EdgeData)
      .values(
        edges.map((e, i) => ({
          // Since edges store field values in a flat array we have to multiply
          // i by the number of fields to ensure it points to the first field of
          // the edge.
          index: offset + i * edgeFieldCount,
          fieldValues: e,
        })),
      )
      .execute();
    logger?.(
      `${(offset / edgeFieldCount).toLocaleString()} edges of ${total.toLocaleString()} imported`,
    );
  };

  const onStringBatch = async (
    strings: string[],
    offset: number,
  ): Promise<void> => {
    await db
      .createQueryBuilder()
      .insert()
      .into(HeapString)
      .values(
        strings.map((s, i) => ({
          index: offset + i,
          value: s,
        })),
      )
      .execute();
    logger?.(`${offset.toLocaleString()} strings imported`);
  };

  let reject: (err: Error) => void;
  await Promise.race([
    new Promise((_, rej) => {
      reject = rej;
    }),
    parseSnapshotFile(snapshotPath, {
      onSnapshot,
      onNodeBatch,
      onEdgeBatch,
      onStringBatch,
      async onError(err) {
        logger?.("Invalid file contents.");
        await fs.promises.rm(outputPath);
        reject(err);
      },
    }),
  ]);

  logger?.("Processing nodes");
  await processNodes(db);
  logger?.("Rebuilding object graph");
  await processEdges(db);
  logger?.("Done!");

  return db;
}
