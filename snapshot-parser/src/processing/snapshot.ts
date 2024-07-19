import { EdgeField, NodeField, Snapshot } from "@memlaser/database";
import { DataSource } from "typeorm";

export async function getSnapshot(db: DataSource): Promise<Snapshot> {
  const snapshot = await db.getRepository(Snapshot).find();

  return snapshot[0];
}

export type NodeFieldIndices = Record<NodeField, number>;
export function buildNodeFieldIndices(snapshot: Snapshot): NodeFieldIndices {
  const { nodeFields } = snapshot.meta;

  const lookup = nodeFields.reduce((lookup, key, index) => {
    lookup[key as NodeField] = index;
    return lookup;
  }, {} as Partial<NodeFieldIndices>);

  return lookup as NodeFieldIndices;
}

export type EdgeFieldIndices = Record<EdgeField, number>;
export function buildEdgeFieldIndices(snapshot: Snapshot): EdgeFieldIndices {
  const { edgeFields } = snapshot.meta;

  const lookup = edgeFields.reduce((lookup, key, index) => {
    lookup[key as EdgeField] = index;
    return lookup;
  }, {} as Partial<EdgeFieldIndices>);

  return lookup as EdgeFieldIndices;
}
