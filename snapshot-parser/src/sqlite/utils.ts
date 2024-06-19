import { Kysely } from "kysely";
import { Database } from "./db";

export interface Snapshot {
  id: number;
  nodeCount: number;
  edgeCount: number;
  traceFunctionCount: number;
  meta: Meta;
}

export interface Meta {
  node_fields: string[];
  node_types: [string[], ...string[]];
  edge_fields: string[];
  edge_types: [string[], ...string[]];
  trace_function_info_fields: string[];
  trace_node_fields: string[];
  sample_fields: string[];
  location_fields: string[];
}

export async function getSnapshot(db: Kysely<Database>): Promise<Snapshot> {
  const rawSnapshot = await db
    .selectFrom("snapshots")
    .selectAll()
    .executeTakeFirstOrThrow();

  return {
    ...rawSnapshot,
    meta: JSON.parse(rawSnapshot.meta),
  };
}
