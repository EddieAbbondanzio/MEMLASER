import { DataSource, FindOptionsOrder, ObjectLiteral } from "typeorm";
import { Edge } from "./entities/edge.js";
import { Node } from "./entities/node.js";
import { Snapshot } from "./entities/snapshot.js";
import { EdgeData } from "./entities/edgeData.js";
import { NodeData } from "./entities/nodeData.js";
import { HeapString } from "./entities/heapString.js";
import { Init1720318566156 } from "./migrations/1_init.js";
import { SnakeCaseNamingStrategy } from "./snakeCaseNamingStrategy.js";
import { SnapshotStats } from "./entities/snapshotStats.js";

export async function initializeSQLite(
  outputPath: string,
): Promise<DataSource> {
  const dataSource = new DataSource({
    type: "better-sqlite3",
    database: outputPath,
    // TODO: Load entities and migrations auto-magically!
    entities: [
      Snapshot,
      Edge,
      EdgeData,
      Node,
      NodeData,
      SnapshotStats,
      HeapString,
    ],
    migrations: [Init1720318566156],
    namingStrategy: new SnakeCaseNamingStrategy(),
  });
  await dataSource.initialize();
  await dataSource.runMigrations({ transaction: "all" });
  return dataSource;
}

export async function* batchSelectAll<T extends ObjectLiteral>(
  db: DataSource,
  table: new () => T,
  orderBy: keyof T,
  batchSize: number,
): AsyncGenerator<T[], void, void> {
  // Repeat batches until we get a batch smaller than batchSize. That means
  // we are done!

  const order = { [orderBy]: "ASC" } as FindOptionsOrder<T>;

  let offset = 0;
  while (true) {
    const rows = await db
      .getRepository<T>(table)
      .find({ take: batchSize, skip: offset, order });
    offset += batchSize;

    yield rows;
    // If the last batch we got was smaller than the batchSize, it means that
    // that it was the last batch and we can stop.
    if (rows.length < batchSize) {
      return;
    }
  }
}
