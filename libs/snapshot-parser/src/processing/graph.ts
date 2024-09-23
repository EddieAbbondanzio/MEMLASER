import { Edge, GC_ROOTS_NAME, Node, batchSelectAll } from "@memlaser/database";
import _ from "lodash";
import { DataSource } from "typeorm";

const BATCH_SIZE = 10_000;

interface NodeLookup {
  nodesById: NodesById;
  gcRootsNode: NodeWithFamily;
}

type NodesById = Record<string, NodeWithFamily>;

interface NodeWithFamily {
  node: Node;
  parentNodeIds: number[];
  childrenNodeIds: number[];
}

// Assumptions:
// - There is enough memory for us to load the entire graph at once.
// - There will be cyclical references that we need to be careful with.
export async function processGraph(db: DataSource): Promise<void> {
  const { nodesById, gcRootsNode } = await buildNodeLookup(db);

  // Calculate depth first so we can use it when calculating retained size.
  await calculateNodeDepths(nodesById, gcRootsNode);
  await calculateNodeRetainedSizes(nodesById);

  const nodes = Object.values(nodesById);
  for (const batch of _.chunk(nodes, BATCH_SIZE)) {
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

export async function buildNodeLookup(db: DataSource): Promise<NodeLookup> {
  let gcRootNode: NodeWithFamily | null = null;
  const nodesById: Record<string, NodeWithFamily> = {};

  for await (const nodes of batchSelectAll(db, Node, "id", BATCH_SIZE)) {
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

export async function getNodeFamilies(
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

export async function calculateNodeDepths(
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

  // Iterate the graph in level order so we can ensure we've visited the
  // shallower nodes first.
  const queue = [...roots];
  while (queue.length > 0) {
    const node = queue.shift()!;

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

export async function calculateNodeRetainedSizes(
  nodesById: NodesById,
): Promise<void> {
  const leaves = Object.values(nodesById).filter(
    n => n.childrenNodeIds.length === 0,
  );

  // Leaf nodes will have a retained size equal to shallow size so we start with
  // them first.
  const queue = [...leaves];
  while (queue.length > 0) {
    const node = queue.shift()!;

    const children = node.childrenNodeIds.map(c => nodesById[c]);

    // If a child is missing it's retained size, and the edge is retaining we
    // can't calculate retained size for this node yet.
    //
    // TODO: Handle non retaining edges
    if (children.some(c => c.node.retainedSize == null)) {
      continue;
    }

    let retainedSize = node.node.shallowSize;
    for (const child of children) {
      // TODO: Check if edge is non-retaining!
      retainedSize += child.node.retainedSize!;
    }
    node.node.retainedSize = retainedSize;

    const parents = node.parentNodeIds.map(p => nodesById[p]);
    queue.push(...parents);
  }
}
