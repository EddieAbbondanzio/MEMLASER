import { Edge, Node, batchSelectAll } from "@memlaser/database";
import * as _ from "lodash";
import { DataSource, In } from "typeorm";

enum Color {
  // Node has been visited, but one or more children hasn't been visited yet so
  // the node isn't ready yet.
  RED,
  // Node has had every child visited, and it's retainedSize has been calculated
  GREEN,
}

type NodeWithFamily = {
  node: Node;
  parentNodeIds: number[];
  childrenNodeIds: number[];
  color?: Color;
};

// Assumptions:
// - There is enough memory for us to load the entire graph at once.
export async function processGraph(db: DataSource): Promise<void> {
  const nodesWithEdges: NodeWithFamily[] = [];
  for await (const nodes of batchSelectAll(db, Node, "id", 10_000)) {
    const nodeIds = nodes.map(n => n.id);
    console.log({ nodeIds });

    // This is returning nothing
    const edges = await db
      .getRepository(Edge)
      .createQueryBuilder()
      .where(
        "from_node_id IN (:...fromNodeIds) OR to_node_id IN (:...toNodeId)",
        { fromNodeIds: nodeIds, toNodeId: nodeIds },
      )
      .getMany();

    for (const node of nodes) {
      nodesWithEdges.push({
        node,
        parentNodeIds: edges.filter(e => e.toNodeId == node.id).map(e => e.id),
        childrenNodeIds: edges
          .filter(e => e.fromNodeId == node.id)
          .map(e => e.id),
      });
    }
  }

  const nodesById: Record<string, NodeWithFamily> = {};
  let nodesToVisit: NodeWithFamily[] = [];
  console.log({ nodesWithEdges });

  // Build node lookup table and grab the leaves so we can visit them first.
  for (const node of nodesWithEdges) {
    nodesById[node.node.id] = node;

    if (node.childrenNodeIds.length === 0) {
      nodesToVisit.push(node);

      // Objects without properties have a retained size equal to shallow size
      // because they don't reference any other objects.
      node.node.retainedSize = node.node.shallowSize;
      node.color = Color.GREEN;
    }
  }

  // Calculate retained size by starting with the leaves and traversing up the
  // branches until we hit root.
  while (nodesToVisit.length > 0) {
    const node = nodesToVisit.shift()!;
    console.log(`Visit node ID: ${node.node.id}`);

    // Nothing left to do here. Node has already had it's retained size
    // calculated.
    if (node.color == Color.GREEN) {
      console.log("- GREEN! Stop.");
      continue;
    }

    // This is the Node's first visit. Mark it so it won't accidentally get
    // visited again. (ie: We think it's a parent that hasn't been visited yet)
    if (node.color == undefined) {
      console.log("- First visit. Set it RED");
      node.color = Color.RED;
    }

    // See if every retained child has been had it's size calculated so we can
    // calculate this nodes retained size.
    const children = node.childrenNodeIds.map(c => nodesById[c]);

    if (children.every(c => c.color == Color.GREEN)) {
      console.log("- Every child is GREEN. Let's make this one GREEN.");
      // TODO: Update this to handle skipping children that have a non
      // retaining edge. (Use helper `shouldFollowForRetainedSize`)
      node.node.retainedSize ??= 0;
      children.forEach(c => (node.node.retainedSize! += c.node.retainedSize!));
      node.color = Color.GREEN;
    }

    // We only visit parents if they haven't been visited yet to avoid going
    // into infinite lo
    const parentsToVisit = node.parentNodeIds
      .map(id => nodesById[id]!)
      .filter(p => p.color != undefined);
    nodesToVisit.push(...parentsToVisit);
    console.log("- Parents to visit: ", parentsToVisit);

    // Calculate depth. We start with the synthetic GC Roots node even though it
    // has a parent because everything above the GC Root is not accessible to the
    // app code and unlikely to be related to any leaks.
    const { id: gcRootsId } = await db
      .getRepository(Node)
      .createQueryBuilder()
      .where("name = :name", { name: "(GC roots)" })
      .getOneOrFail();

    const gcRoot = nodesById[gcRootsId];
    gcRoot.node.depth = 0;
    nodesToVisit = [...gcRoot.childrenNodeIds.map(c => nodesById[c]!)];
    console.log("- Nodes to visit: ", nodesToVisit);

    while (nodesToVisit.length > 0) {
      const node = nodesToVisit.shift()!;
      if (node.node.depth != undefined) {
        continue;
      }

      const parentNodes = node.parentNodeIds.map(id => nodesById[id]!);
      if (parentNodes.every(p => p.node.depth != null)) {
        // Shallowest depth is most interesting because there's a chance deeper
        // parents are just circular references.
        const shallowestParent = parentNodes.reduce((prev, curr) =>
          prev.node.depth! > curr.node.depth! ? curr : prev,
        );

        node.node.depth = shallowestParent.node.depth! + 1;
      } else {
        // Re-visit it once it's parent's are done.
        nodesToVisit.push(node);
      }
    }

    console.log("====");
    console.log(nodesById);
    console.log("====");

    // Update depth and retained size into the db.
    for (const batch of _.chunk(nodesWithEdges, 10_000)) {
      const valuesArray = batch.map(
        ({ node }) => `(${node.id}, ${node.depth}, ${node.retainedSize})`,
      );

      // Src: https://stackoverflow.com/a/18799497
      await db.query(`
        UPDATE nodes AS n SET
          depth = c.depth,
          retained_size = c.retained_size
        FROM (values
          ${valuesArray.join(", ")}
        ) as c(id, depth, retained_size)
        WHERE c.id = n.id;
      `);
    }
  }
}
