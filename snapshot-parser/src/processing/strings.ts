import _ from "lodash";
import { DataSource, In } from "typeorm";
import { HeapString } from "../sqlite/entities/heapString.js";

export async function getStringsByIndex(
  db: DataSource,
  indices: number[],
): Promise<_.Dictionary<{ index: number; value: string }>> {
  const strings = await db.getRepository(HeapString).findBy({
    index: In(indices),
  });

  return _.keyBy(strings, s => s.index);
}
