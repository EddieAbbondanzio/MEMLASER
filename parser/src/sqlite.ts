import {
  CamelCasePlugin,
  FileMigrationProvider,
  JSONColumnType,
  Kysely,
  Migrator,
  ParseJSONResultsPlugin,
  SqliteDialect,
  Generated,
} from "kysely";
import SQLiteDatabase from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";
import { MetaJSON } from "./json/schema";

interface Database {
  // N.B. Keys must match table names.
  snapshots: SnapshotsTable;
  nodes: NodesTable;
  edges: EdgesTable;
  nodeEdges: NodeEdgesTable;
}

interface SnapshotsTable {
  id: Generated<number>;
  meta: JSONColumnType<MetaJSON>;
  nodeCount: number;
  edgeCount: number;
  traceFunctionCount: number;
}

interface NodesTable {}
interface EdgesTable {}
interface NodeEdgesTable {}

export async function initializeSQLiteDB(
  outputPath: string,
): Promise<Kysely<Database>> {
  const dialect = new SqliteDialect({
    database: new SQLiteDatabase(outputPath),
  });

  const db = new Kysely<Database>({
    dialect,
    plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
    log: console.log,
  });
  await migrate(db);
  return db;
}

async function migrate(db: Kysely<Database>): Promise<void> {
  // N.B. Must be an absolute path.
  const migrationFolder = path.join(__dirname, "migrations");

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs: fs.promises,
      path,
      migrationFolder,
    }),
  });

  const { error, results } = await migrator.migrateToLatest();
  if (error) {
    throw error;
  }

  const failures = results?.filter(m => m.status === "Error") ?? [];
  if (failures?.length > 0) {
    throw new Error(`Failed to run migrations: ${failures.join(", ")}`);
  }
}
