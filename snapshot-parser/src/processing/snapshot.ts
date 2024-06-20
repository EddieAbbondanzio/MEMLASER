import { Kysely } from "kysely";
import { Database } from "../sqlite/db";
import { MetaJSON, NodeFieldJSON } from "../json/schema";

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

type NodeFieldLookup = Record<NodeFieldJSON, number>;
export function buildNodeFieldLookup(snapshot: Snapshot): NodeFieldLookup {
  const { node_fields: nodeFields } = snapshot.meta;

  const lookup = nodeFields.reduce((lookup, key, index) => {
    lookup[key as NodeFieldJSON] = index;
    return lookup;
  }, {} as Partial<NodeFieldLookup>);

  return lookup as NodeFieldLookup;
}
