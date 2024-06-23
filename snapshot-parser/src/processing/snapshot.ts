import { Kysely } from "kysely";
import { Database } from "../sqlite/db";
import { EdgeFieldJSON, MetaJSON, NodeFieldJSON } from "../json/schema";

export interface Snapshot {
  id: number;
  nodeCount: number;
  edgeCount: number;
  traceFunctionCount: number;
  meta: MetaJSON;
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

export type NodeFieldLookup = Record<NodeFieldJSON, number>;
export function buildNodeFieldLookup(snapshot: Snapshot): NodeFieldLookup {
  const { node_fields: nodeFields } = snapshot.meta;

  const lookup = nodeFields.reduce((lookup, key, index) => {
    lookup[key as NodeFieldJSON] = index;
    return lookup;
  }, {} as Partial<NodeFieldLookup>);

  return lookup as NodeFieldLookup;
}

export type EdgeFieldLookup = Record<EdgeFieldJSON, number>;
export function buildEdgeFieldLookup(snapshot: Snapshot): EdgeFieldLookup {
  const { edge_fields: edgeFields } = snapshot.meta;

  const lookup = edgeFields.reduce((lookup, key, index) => {
    lookup[key as EdgeFieldJSON] = index;
    return lookup;
  }, {} as Partial<EdgeFieldLookup>);

  return lookup as EdgeFieldLookup;
}
