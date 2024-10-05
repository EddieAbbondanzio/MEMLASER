import {
  Edge,
  EdgeType,
  GC_ROOTS_NAME,
  Node,
  batchSelectAll,
  isRetainingEdge,
} from "@memlaser/database";
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
  parentNodes: NodeEdge[];
  childrenNodes: NodeEdge[];
}

interface NodeEdge {
  edgeType: EdgeType;
  nodeId: number;
}

// Assumptions:
// - There is enough memory for us to load the entire graph at once.
// - There will be cyclical references that we need to be careful with.
export async function processGraph(db: DataSource): Promise<void> {
  const { nodesById, gcRootsNode } = await buildNodeLookup(db);

  const roots = await calculateRoots(nodesById, gcRootsNode);
  await calculateNodeDepths(nodesById, roots);
  await calculateNodeRetainedSizes(nodesById, roots);

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
    parentNodes: edges
      .filter(e => e.toNodeId == node.id)
      .map(e => ({ nodeId: e.fromNodeId, edgeType: e.type })),
    childrenNodes: edges
      .filter(e => e.fromNodeId == node.id)
      .map(e => ({ nodeId: e.toNodeId, edgeType: e.type })),
  }));
}

export async function calculateRoots(
  nodesById: NodesById,
  gcRootsNode: NodeWithFamily,
): Promise<NodeWithFamily[]> {
  // Start with the synthetic GC roots node even though it has a parent because
  // everything above the GC roots is not accessible to app code and unlikely to
  // be leaky.
  gcRootsNode.node.depth = 0;
  const roots = gcRootsNode.childrenNodes.map(r => nodesById[r.nodeId]);
  for (const root of roots) {
    root.node.root = true;
    root.node.depth = 1;
  }

  if (roots.length === 0) {
    throw new Error("Invalid heap snapshot. No root nodes.");
  }

  return roots;
}

export async function calculateNodeDepths(
  nodesById: NodesById,
  roots: NodeWithFamily[],
): Promise<void> {
  // Iterate the graph in level order so we can ensure we've visited the
  // shallower nodes first.
  const queue = [...roots];
  while (queue.length > 0) {
    const node = queue.shift()!;

    // Depth is based off the parent closest to GC root because deeper parents
    // could just be circular references.
    const shallowestParent = node.parentNodes
      .map(p => nodesById[p.nodeId])
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

    const children = node.childrenNodes.map(c => nodesById[c.nodeId]);
    if (depthWasSet || children.some(c => c.node.depth == null)) {
      queue.push(...children);
    }
  }
}

export async function calculateNodeRetainedSizes(
  nodesById: NodesById,
  roots: NodeWithFamily[],
): Promise<void> {
  // We need to do this to better handle circular references.
  // Below doesn't work because circular references between children have the
  // wrong retained size for 1 of the children.

  const recursiveStep = (node: NodeWithFamily, visited: NodeWithFamily[]) => {
    console.log(
      "Visit: ",
      node.node,
      " path taken was: ",
      visited.map(v => v.node.id).join(", "),
    );
    // Leaf nodes will always have a retained size equal to their shallow size
    // since they don't hold references.
    if (node.childrenNodes.length === 0) {
      return node.node.shallowSize;
    }

    let childrenSize = node.node.shallowSize;
    let returnSize = node.node.shallowSize;
    for (const c of node.childrenNodes) {
      if (
        !isRetainingEdge(c.edgeType) ||
        nodesById[c.nodeId].node.retainedSize != null
      )
        continue;

      let size;
      // Ignore a reference if we found a way back to a visited node to prevent
      // double counting children.
      const alreadyVisited = visited.find(p => p.node.id === c.nodeId);
      if (alreadyVisited != null) {
        console.log(
          "-- Found reference to previously visited node: ",
          alreadyVisited.node.id,
          " from: ",
          node.node.id,
          " child: ",
          c.nodeId,
        );
        size = nodesById[c.nodeId].node.shallowSize;
        console.log("-- Use shallow size for: ", c.nodeId, " size: ", size);
      } else {
        size = recursiveStep(nodesById[c.nodeId], [
          ...visited,
          nodesById[c.nodeId],
        ]);
        console.log(
          "-- Calculated retained size for: ",
          c.nodeId,
          " size: ",
          size,
        );
      }

      childrenSize += size;
      // Don't add size if already visited because it'll cause the already
      // visited node to have it's own size added to it's retained size.
      returnSize += alreadyVisited ? 0 : size;
    }

    nodesById[node.node.id].node.retainedSize = childrenSize;
    console.log("-- ", node.node.id, " done! ", { childrenSize, returnSize });
    return returnSize;
  };

  for (const root of roots) {
    root.node.retainedSize = recursiveStep(root, [root]);
  }
}
