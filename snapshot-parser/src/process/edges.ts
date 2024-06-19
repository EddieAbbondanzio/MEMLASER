// export interface Edge {
//   type: EdgeObjectType;
//   name: string;
//   toNode: number;
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
