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
    await snapshot.destroy();

    // How do we generate list of summary groups?
    // -- Do we build list of constructors, and then get instance count
    //    / retained size / shallow size from them?

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
