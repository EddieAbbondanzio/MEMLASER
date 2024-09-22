import { Edge, GC_ROOTS_NAME, Node, batchSelectAll } from "@memlaser/database";
import _ from "lodash";
import { DataSource } from "typeorm";

// TODO: Delete?
enum Color {
  // Node has been visited, but one or more children hasn't been visited yet so
  // the node isn't ready yet.
  RED,
  // Node has had every child visited, and it's retainedSize has been calculated
  GREEN,
}

interface NodeLookup {
  nodesById: NodesById;
  gcRootsNode: NodeWithFamily;
}

type NodesById = Record<string, NodeWithFamily>;

interface NodeWithFamily {
  node: Node;
  parentNodeIds: number[];
  childrenNodeIds: number[];
  color?: Color;
}

// Assumptions:
// - There is enough memory for us to load the entire graph at once.
// - There will be cyclical references that we need to be careful with.
export async function processGraph(db: DataSource): Promise<void> {
  const { nodesById, gcRootsNode } = await buildNodeLookup(db);

  // Calculate depth first so we can use it when calculating retained size.
  await calculateNodeDepths(nodesById, gcRootsNode);

  // Calculate depth first so we can use it when calculating retained size.

  // If we calculate depth first we can use it to tell what order to process
  // nodes in when calculating retained size.

  // Calculate retained size by starting with the leaves and traversing up the
  // branches until we hit root.
  // while (nodesToVisit.length > 0) {
  //   const node = nodesToVisit.shift()!;
  //   console.log(`Visit node ID: ${node.node.id}`);

  //   if (node.color != Color.GREEN) {
  //     // This is the Node's first visit. Mark it so it won't accidentally get
  //     // visited again. (ie: We think it's a parent that hasn't been visited yet)
  //     if (node.color == undefined) {
  //       console.log("- First visit. Set it RED");
  //       node.color = Color.RED;
  //     }

  //     // Leaf node.
  //     if (node.childrenNodeIds.length === 0) {
  //       console.log("- It's a leaf. Set retained size = shallow size.");
  //       node.color = Color.GREEN;
  //       node.node.retainedSize = node.node.shallowSize;
  //     } else {
  //       // See if every retained child has been had it's size calculated so we can
  //       // calculate this nodes retained size.
  //       const children = node.childrenNodeIds.map(c => nodesById[c]);

  //       if (children.every(c => c.color == Color.GREEN)) {
  //         console.log("- Every child is GREEN. Let's make this one GREEN.");
  //         // TODO: Update this to handle skipping children that have a non
  //         // retaining edge. (Use helper `isRetainingEdge`)
  //         node.node.retainedSize ??= 0;
  //         children.forEach(
  //           c => (node.node.retainedSize! += c.node.retainedSize!),
  //         );
  //         node.color = Color.GREEN;
  //       } else {
  //         console.log("NOT READY YET!");
  //         continue;
  //       }
  //     }

  //     // We only visit parents if they haven't been visited yet to avoid going
  //     // into infinite lo
  //     const parentsToVisit = node.parentNodeIds
  //       .map(id => nodesById[id]!)
  //       .filter(p => p.node.name !== "(GC roots)" && p.color == undefined);

  //     nodesToVisit.push(...parentsToVisit);
  //     console.log(
  //       "- Parents to visit: ",
  //       parentsToVisit.map(p => p),
  //     );
  //   }
  // }

  // console.log("DONE CALCULATING SIZE!!!!");
  // return;

  const nodes = Object.values(nodesById);
  for (const batch of _.chunk(nodes, 10_000)) {
    const valuesArray = batch.map(
      ({ node }) =>
        `(${node.id}, ${node.depth ?? "null"}, ${node.retainedSize ?? "null"}, ${node.root ?? "null"})`,
    );

    await db.query(`
      WITH updated_node_values(id, depth, retained_size, root) as (VALUES
        ${valuesArray.join(", ")}
      )
      UPDATE nodes SET
        depth = updated_node_values.depth,
        retained_size = updated_node_values.retained_size,
        root = updated_node_values.root
      FROM
        updated_node_values
      WHERE
        nodes.id = updated_node_values.id;
    `);
  }
}

async function buildNodeLookup(db: DataSource): Promise<NodeLookup> {
  let gcRootNode: NodeWithFamily | null = null;
  const nodesById: Record<string, NodeWithFamily> = {};

  for await (const nodes of batchSelectAll(db, Node, "id", 10_000)) {
    const nodesWithFamily = await getNodeFamilies(db, nodes);
    for (const node of nodesWithFamily) {
      nodesById[node.node.id] = node;

      if (node.node.name === GC_ROOTS_NAME) {
        if (gcRootNode != null) {
          throw new Error("Detected duplicate GC root nodes");
        }

        gcRootNode = node;
      }
    }
  }

  if (gcRootNode == null) {
    // Sanity check. This should really only throw in testing scenarios, but it
    // may also throw if a Bun or Deno snapshot were attempted to be loaded.
    throw new Error(
      `No ${GC_ROOTS_NAME} node found. Was this a Node.js heapdump?`,
    );
  }

  return {
    nodesById,
    gcRootsNode: gcRootNode,
  };
}

async function getNodeFamilies(
  db: DataSource,
  nodes: Node[],
): Promise<NodeWithFamily[]> {
  const nodeIds = nodes.map(n => n.id);

  const edges = await db
    .getRepository(Edge)
    .createQueryBuilder()
    .where(
      "from_node_id IN (:...fromNodeIds) OR to_node_id IN (:...toNodeId)",
      { fromNodeIds: nodeIds, toNodeId: nodeIds },
    )
    .getMany();

  return nodes.map(node => ({
    node,
    parentNodeIds: edges
      .filter(e => e.toNodeId == node.id)
      .map(e => e.fromNodeId),
    childrenNodeIds: edges
      .filter(e => e.fromNodeId == node.id)
      .map(e => e.toNodeId),
  }));
}

async function calculateNodeDepths(
  nodesById: NodesById,
  gcRootsNode: NodeWithFamily,
): Promise<void> {
  // Start with the synthetic GC roots node even though it has a parent because
  // everything above the GC roots is not accessible to app code and unlikely to
  // be leaky.
  gcRootsNode.node.depth = 0;
  const roots = gcRootsNode.childrenNodeIds.map(c => nodesById[c]);
  for (const root of roots) {
    root.node.root = true;
    root.node.depth = 1;
  }

  if (roots.length === 0) {
    throw new Error("Invalid heap snapshot. No root nodes.");
  }

  const queue = [...roots];
  while (queue.length > 0) {
    const node = queue.shift()!;
    console.log("Visit:", node.node);

    // Depth is based off the parent closest to GC root because deeper parents
    // could just be circular references.
    const shallowestParent = node.parentNodeIds
      .map(p => nodesById[p])
      .filter(p => p.node.depth != null)
      .reduce((prev, curr) =>
        prev.node.depth! > curr.node.depth! ? curr : prev,
      );
    const depth = shallowestParent.node.depth! + 1;
    let depthWasSet = false;

    // Only set the depth of the node when:
    // - It's null. This means we haven't visited it yet.
    // - The new depth is shallower. We need to go back and update the children.
    if (node.node.depth == null || node.node.depth > depth) {
      node.node.depth = depth;
      depthWasSet = true;
    }

    const children = node.childrenNodeIds.map(c => nodesById[c]);
    if (depthWasSet || children.some(c => c.node.depth == null)) {
      queue.push(...children);
    }
  }
}
