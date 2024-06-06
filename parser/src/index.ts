import { initializeSQLiteDB } from "./sqlite";
import { parseSnapshot } from "./json";

// Reference(s):
// https://learn.microsoft.com/en-us/microsoft-edge/devtools-guide-chromium/memory-problems/heap-snapshot-schema

async function main(): Promise<void> {
  await parseSnapshotToSQLite({
    snapshotPath: "samples/reddit.heapsnapshot",
    outputPath: "samples/reddit.sqlite",
  });
}
void main();

interface ParseSnapshotToSQLiteOptions {
  snapshotPath: string;
  outputPath: string;
}

export async function parseSnapshotToSQLite(
  options: ParseSnapshotToSQLiteOptions,
): Promise<void> {
  const { snapshotPath, outputPath } = options;
  const db = await initializeSQLiteDB(outputPath);

  await parseSnapshot(snapshotPath);

  // TODO: Replace this with stream async!

  // const rawSnapshot = await fs.promises.readFile(snapshotPath);
  // const jsonSnapshot: HeapSnapshot = JSON.parse(rawSnapshot.toString());

  // const parsedNodes = parseNodes(jsonSnapshot);
  // const parsedEdges = parseEdges(jsonSnapshot);

  // const nodes = buildObjectGraph(parsedNodes, parsedEdges);
}

// export function parseNodes(heapSnapshot: HeapSnapshot): Node[] {
//   const { snapshot, nodes } = heapSnapshot;
//   const totalNodeCount = snapshot.node_count;
//   const nodeFields = snapshot.meta.node_fields;
//   const numOfNodeFields = nodeFields.length;

//   if (numOfNodeFields !== NUM_OF_NODE_FIELDS) {
//     throw new Error(
//       `Invalid snapshot. Expected ${NUM_OF_NODE_FIELDS} node fields, got ${numOfNodeFields}.`,
//     );
//   }
//   if (nodes.length % numOfNodeFields !== 0) {
//     throw new Error(
//       `Invalid snapshot. Number of elements in nodes is not divisible by length of node_fields.`,
//     );
//   }

//   const parsedNodes = [];
//   for (let i = 0; i < totalNodeCount; i++) {
//     const index = i * numOfNodeFields;
//     const node = parseNode(heapSnapshot, index, numOfNodeFields);
//     parsedNodes.push(node);
//   }

//   return parsedNodes;
// }

// export function parseNode(
//   heapSnapshot: HeapSnapshot,
//   index: number,
//   numOfFields: number,
// ): Node {
//   const { nodes, strings } = heapSnapshot;
//   const values = nodes.slice(index, index + numOfFields);

//   const type = NODE_TYPES[0][values[0]] as NodeObjectType;
//   const name = strings[values[1]];
//   const id = values[2];
//   const selfSize = values[3];
//   const edgeCount = values[4];
//   const traceNodeId = values[5];
//   const detached = Boolean(values[6]);

//   const data: NodeData = {
//     nodeIndex: index,
//     type,
//     name,
//     id,
//     selfSize,
//     edgeCount,
//     traceNodeId,
//     detached,
//   };
//   return new Node(data);
// }

// export function parseEdges(heapSnapshot: HeapSnapshot): Edge[] {
//   const { snapshot, edges } = heapSnapshot;
//   const totalEdgeCount = snapshot.edge_count;
//   const edgeFields = snapshot.meta.edge_fields;
//   const numOfEdgeFields = edgeFields.length;

//   if (numOfEdgeFields !== NUM_OF_EDGE_FIELDS) {
//     throw new Error(
//       `Invalid snapshot. Expected ${NUM_OF_NODE_FIELDS} edge fields, got ${numOfEdgeFields}.`,
//     );
//   }
//   if (edges.length % numOfEdgeFields !== 0) {
//     throw new Error(
//       `Invalid snapshot. Number of elements in edges is not divisible by length of edge_fields.`,
//     );
//   }

//   const parsedEdges = [];
//   for (let i = 0; i < totalEdgeCount; i++) {
//     const index = i * numOfEdgeFields;
//     const node = parseEdge(heapSnapshot, index, numOfEdgeFields);
//     parsedEdges.push(node);
//   }

//   return parsedEdges;
// }

// export function parseEdge(
//   heapSnapshot: HeapSnapshot,
//   index: number,
//   numOfFields: number,
// ): Edge {
//   const { edges, strings } = heapSnapshot;
//   const values = edges.slice(index, index + numOfFields);

//   const type = EDGE_TYPES[0][values[0] as number] as EdgeObjectType;
//   const nameOrIndex = values[1];
//   const toNode = values[2] as number;

//   let name;
//   if (typeof nameOrIndex === "string") {
//     name = nameOrIndex;
//   } else {
//     name = strings[nameOrIndex];
//   }

//   const data: EdgeData = {
//     type,
//     name,
//     toNode,
//   };
//   return new Edge(data);
// }

// export function buildObjectGraph(nodes: Node[], edges: Edge[]): Node[] {
//   const nodesByIndex: Record<number, Node | undefined> = {};
//   for (const node of nodes) {
//     if (nodesByIndex[node.nodeIndex] !== undefined) {
//       throw new Error(`Duplicate node id ${node.nodeIndex}.`);
//     }
//     nodesByIndex[node.nodeIndex] = node;
//   }

//   let edgeIndex = 0;

//   for (const node of nodes) {
//     const { edgeCount } = node;
//     const currEdges = edges.slice(edgeIndex, edgeIndex + edgeCount);

//     for (const edge of currEdges) {
//       edge.from = node;
//       const to = nodesByIndex[edge.toNode];

//       if (to === undefined) {
//         throw new Error(
//           `No matching node found for edge.toNode (index: ${edge.toNode}`,
//         );
//       }
//       edge.to = to;
//     }

//     node.edges = currEdges;
//     edgeIndex += edgeCount;
//   }

//   return nodes;
// }
