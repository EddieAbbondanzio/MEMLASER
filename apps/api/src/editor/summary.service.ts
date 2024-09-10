import { Injectable } from "@nestjs/common";
import { SummaryGroupDTO } from "./dtos/snapshot.js";
import { Node, NodeType, openSQLiteDB } from "@memlaser/database";
import { DataSource } from "typeorm";

type SummaryConstructor =
  | { custom: false; name: NodeType }
  | { custom: true; name: string };

@Injectable()
export class SummaryService {
  async getSummary(snapshotPath: string): Promise<SummaryGroupDTO[]> {
    const snapshot = await openSQLiteDB(snapshotPath);

    const constructors = await getConstructors(snapshot);
    console.log(constructors.length);
    await snapshot.destroy();

    // How do we get shallow size, retained size, and (average) distance for
    // each constructor? I can't see any other way besides running a recursive
    // CTE that iterates the object graph for each instance of a ctor

    // OH. We should do it when parsing the snapshot!
    // We can add distance, shallow size, retained size to each node
    // Then when querying constructors we sum or average the values as needed!

    return [];
  }
}

async function getConstructors(
  snapshot: DataSource,
): Promise<SummaryConstructor[]> {
  const builtInConstructors: SummaryConstructor[] = Object.keys(NodeType)
    .filter((nt) => nt !== NodeType.Object)
    .map((name) => ({ custom: false, name: name as NodeType }));

  const customConstructorNames: Array<Pick<Node, "name">> = await snapshot
    .getRepository(Node)
    .createQueryBuilder()
    .select(["name"])
    .where("type = 'object'")
    .distinct()
    .execute();
  const customConstructors: SummaryConstructor[] = customConstructorNames.map(
    ({ name }) => ({
      custom: true,
      name,
    }),
  );
  return [...builtInConstructors, ...customConstructors];
}
