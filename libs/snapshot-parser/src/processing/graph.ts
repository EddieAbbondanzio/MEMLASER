import { Edge, Node } from "@memlaser/database";
import { DataSource, In } from "typeorm";

export async function processGraph(db: DataSource): Promise<void> {
  const nodeRepo = db.getRepository(Node);
  // Root node is always first.
  const [root] = await nodeRepo.findBy({ id: 1 });

  await preorderTraversal(db, root, n => console.log(n.id));

  // TODO: Calculate retained size and distance from root.
  //
  // How to iterate graph?
  // - We need to handle circular references
  // - Can be large number of nodes (ex 100k+) so speed is important
  //
  // Algorithm:
  // Start at root and begin visiting children depth first. On first visit to node
  // we mark it as 1, and then visit it's all of it's children in the same manner.
  // When we hit a leaf, we mark it as 2 and start to go back up through visit history
  // each node we hit is a 2 and we set retained size.
  //
  // When visiting nodes if we set it has a 1 already then it has been visited and can
  // be ignored.
  //
  // Questions:
  // - If we hit a node twice, how do we handle distance?
  //   Seems like we'd set distance based on the shortest route.
}

async function preorderTraversal(
  db: DataSource,
  root: Node,
  callback: (node: Node) => void,
): Promise<void> {
  recursiveStep(root);

  async function recursiveStep(node: Node): Promise<void> {
    callback(node);

    const children = await getNodeChildren(db, node);
    for (const child of children) {
      await recursiveStep(child);
    }
  }
}

async function getNodeChildren(db: DataSource, node: Node): Promise<Node[]> {
  const nodeRepo = db.getRepository(Node);
  const edgeRepo = db.getRepository(Edge);

  const childrenEdges = await edgeRepo.findBy({ fromNodeId: node.id });
  if (node.edgeCount !== childrenEdges.length) {
    throw new Error(
      `Only found ${childrenEdges.length} of ${node.edgeCount} edges for node (id: ${node.id})`,
    );
  }

  // Sort by ID so we can do a pre-order visit of children. (we assume nodes with
  // a lower ID are first)
  const childrenIds = childrenEdges.map(e => e.toNodeId).sort();
  const children = await nodeRepo.findBy({ id: In(childrenIds) });
  return children;
}
