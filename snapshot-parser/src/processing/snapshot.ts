import { DataSource } from "typeorm";
import { EdgeFieldJSON, MetaJSON, NodeFieldJSON } from "../json/schema";
import { Snapshot } from "../sqlite/entities/snapshot";

export interface Snapshot {
  id: number;
  nodeCount: number;
  edgeCount: number;
  traceFunctionCount: number;
  meta: MetaJSON;
}

export async function getSnapshot(db: DataSource): Promise<Snapshot> {
  const rawSnapshot = await db
    .createQueryBuilder()
    .select()
    .from(Snapshot, "snapshot")
    .select("*")
    .execute();

  return {
    ...rawSnapshot,
    meta: JSON.parse(rawSnapshot.meta),
  };
}

export type NodeFieldIndices = Record<NodeFieldJSON, number>;
export function buildNodeFieldIndices(snapshot: Snapshot): NodeFieldIndices {
  const { node_fields: nodeFields } = snapshot.meta;

  const lookup = nodeFields.reduce((lookup, key, index) => {
    lookup[key as NodeFieldJSON] = index;
    return lookup;
  }, {} as Partial<NodeFieldIndices>);

  return lookup as NodeFieldIndices;
}

export type EdgeFieldIndices = Record<EdgeFieldJSON, number>;
export function buildEdgeFieldIndices(snapshot: Snapshot): EdgeFieldIndices {
  const { edge_fields: edgeFields } = snapshot.meta;

  const lookup = edgeFields.reduce((lookup, key, index) => {
    lookup[key as EdgeFieldJSON] = index;
    return lookup;
  }, {} as Partial<EdgeFieldIndices>);

  return lookup as EdgeFieldIndices;
}
