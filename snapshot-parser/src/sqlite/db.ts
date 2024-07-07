import {
  CamelCasePlugin,
  FileMigrationProvider,
  Kysely,
  Migrator,
  SqliteDialect,
  Generated,
  ColumnType,
} from "kysely";
import SQLiteDatabase from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";
import { DataSource } from "typeorm";

export type WithDefault<S> = ColumnType<S, S | undefined, S>;

export interface Database {
  // N.B. Keys must match table names.
  snapshots: SnapshotsTable;
  nodeData: NodeDataTable;
  nodes: NodesTable;
  edgeData: EdgeDataTable;
  edges: EdgesTable;
  strings: StringsTable;
}

interface SnapshotsTable {
  id: Generated<number>;
  meta: string;
  nodeCount: number;
  edgeCount: number;
  traceFunctionCount: number;
}

// Raw node data from the snapshot file. They get processed into actual
// nodes later on when the object graph is rebuilt.
interface NodeDataTable {
  id: Generated<number>;
  index: number;
  fieldValues: string;
}

interface NodesTable {
  id: Generated<number>;
  index: number;
  type: string;
  name: string;
  nodeId: number;
  selfSize: number;
  edgeCount: number;
  traceNodeId: number;
  // No boolean value in sqlite so we use 0 or 1.
  detached: number;
}

// Raw edge data from the snapshot file. They get processed into actual
// edge later on when the object graph is rebuilt.
interface EdgeDataTable {
  id: Generated<number>;
  index: number;
  fieldValues: string;
}

interface EdgesTable {
  id: Generated<number>;
  index: number;
  type: string;
  name: string;
  toNodeId: number;
  fromNodeId: number;
}

interface StringsTable {
  id: Generated<number>;
  index: number;
  value: string;
}

export async function initializeSQLite(
  outputPath: string,
): Promise<DataSource> {
  const dataSource = new DataSource({
    type: "better-sqlite3",
    database: outputPath,
    // TODO: Add entities!
  });
  dataSource.runMigrations();
  return dataSource;
}
