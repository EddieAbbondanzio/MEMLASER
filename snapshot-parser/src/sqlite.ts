import {
  CamelCasePlugin,
  FileMigrationProvider,
  JSONColumnType,
  Kysely,
  Migrator,
  ParseJSONResultsPlugin,
  SqliteDialect,
  Generated,
  ColumnType,
} from "kysely";
import SQLiteDatabase from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";
import { MetaJSON } from "./json/schema";

export type WithDefault<S> = ColumnType<S, S | undefined, S>;

interface Database {
  // N.B. Keys must match table names.
  snapshots: SnapshotsTable;
  nodeData: NodeDataTable;
  edgeData: EdgeDataTable;
  strings: StringsTable;
}

interface SnapshotsTable {
  id: Generated<number>;
  meta: JSONColumnType<MetaJSON>;
  nodeCount: number;
  edgeCount: number;
  traceFunctionCount: number;
}

// Raw node data from the snapshot file. They get processed into actual
// nodes later on when the object graph is rebuilt.
interface NodeDataTable {
  id: Generated<number>;
  index: number;
  fieldValues: JSONColumnType<string[]>;
  processed: WithDefault<boolean>;
}

// Raw edge data from the snapshot file. They get processed into actual
// edge later on when the object graph is rebuilt.
interface EdgeDataTable {
  id: Generated<number>;
  index: number;
  fieldValues: JSONColumnType<string[]>;
  processed: WithDefault<boolean>;
}

interface StringsTable {
  id: Generated<number>;
  index: number;
  value: string;
}

export async function initializeSQLiteDB(
  outputPath: string,
): Promise<Kysely<Database>> {
  const dialect = new SqliteDialect({
    database: new SQLiteDatabase(outputPath),
  });

  const db = new Kysely<Database>({
    dialect,
    plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
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
