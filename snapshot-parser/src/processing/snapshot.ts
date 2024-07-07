import { DataSource } from "typeorm";
import { EdgeFieldJSON, NodeFieldJSON } from "../json/schema";
import { Snapshot } from "../sqlite/entities/snapshot";

// TODO: Do we still need this?
export async function getSnapshot(db: DataSource): Promise<Snapshot> {
  const snapshot = await db.getRepository(Snapshot).find();

  return snapshot[0];
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
