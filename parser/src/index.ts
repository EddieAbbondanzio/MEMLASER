import * as fs from "fs";

// https://learn.microsoft.com/en-us/microsoft-edge/devtools-guide-chromium/memory-problems/heap-snapshot-schema

// These may change in the future, so we check the actual values when parsing.
const NUM_OF_NODE_FIELDS = 7;
const NUM_OF_EDGE_FIELDS = 3;

interface HeapSnapshot {
  snapshot: Snapshot;
  nodes: number[];
  // N.B. Edges will always be a repeating pattern of [number, string | number,
  // number, ...] but that's hard to type so we type it as [number | string,
  // number | string, ...]
  edges: (number | string)[];
  trace_function_infos: unknown[];
  trace_tree: unknown[];
  samples: unknown[];
  locations: number[];
  strings: string[];
}

interface Snapshot {
  meta: Meta;
  node_count: number;
  edge_count: number;
  trace_function_count: number;
}

interface Meta {
  node_fields: NodeFields;
  node_types: NodeTypes;
  edge_fields: EdgeFields;
  edge_types: EdgeTypes;
}

const NODE_FIELDS = [
  "type",
  "name",
  "id",
  "self_size",
  "edge_count",
  "trace_node_id",
  "detachedness",
] as const;
type NodeFields = typeof NODE_FIELDS;

const NODE_TYPES = [
  [
    "hidden",
    "array",
    "string",
    "object",
    "code",
    "closure",
    "regexp",
    "number",
    "native",
    "synthetic",
    "concatenated string",
    "sliced string",
    "symbol",
    "bigint",
    "object shape",
  ],
  "string",
  "number",
  "number",
  "number",
  "number",
  "number",
] as const;
type NodeTypes = typeof NODE_TYPES;

interface Node {
  nodeIndex: number;
  type: NodeObjectType;
  name: string;
  id: number;
  selfSize: number;
  edgeCount: number;
  traceNodeId: number;
  detached: boolean;
}
type NodeObjectType = keyof NodeTypes[0];

const EDGE_FIELDS = ["type", "name_or_index", "to_node"];
type EdgeFields = typeof EDGE_FIELDS;

const EDGE_TYPES = [
  ["context", "element", "property", "internal", "hidden", "shortcut", "weak"],
  "string_or_number",
  "node",
] as const;
type EdgeTypes = typeof EDGE_TYPES;
type EdgeObjectType = keyof EdgeTypes[0];

interface Edge {
  type: EdgeObjectType;
  name: string;
  toNode: number;
}

async function main(): Promise<void> {
  console.log(process.cwd());
  await parseSnapshot("samples/reddit.heapsnapshot");
}
void main();

// TODO: What does this return?
export async function parseSnapshot(filePath: string): Promise<void> {
  const rawContent = await fs.promises.readFile(filePath);
  const rawSnapshot: HeapSnapshot = JSON.parse(rawContent.toString());

  const nodes = parseNodes(rawSnapshot);
  const edges = parseEdges(rawSnapshot);

  // TODO: What does this return?
  buildObjectGraph(nodes, edges);
}

export function parseNodes(heapSnapshot: HeapSnapshot): Node[] {
  const { snapshot, nodes } = heapSnapshot;
  const totalNodeCount = snapshot.node_count;
  const nodeFields = snapshot.meta.node_fields;
  const numOfNodeFields = nodeFields.length;

  if (numOfNodeFields !== NUM_OF_NODE_FIELDS) {
    throw new Error(
      `Invalid snapshot. Expected ${NUM_OF_NODE_FIELDS} node fields, got ${numOfNodeFields}.`,
    );
  }
  if (nodes.length % numOfNodeFields !== 0) {
    throw new Error(
      `Invalid snapshot. Number of elements in nodes is not divisible by length of node_fields.`,
    );
  }

  const parsedNodes = [];
  for (let i = 0; i < totalNodeCount; i++) {
    const index = i * numOfNodeFields;
    const node = parseNode(heapSnapshot, index, numOfNodeFields);
    parsedNodes.push(node);
  }

  return parsedNodes;
}

export function parseNode(
  heapSnapshot: HeapSnapshot,
  index: number,
  numOfFields: number,
): Node {
  const { nodes, strings } = heapSnapshot;
  const values = nodes.slice(index, index + numOfFields);

  const type = NODE_TYPES[0][values[0]] as NodeObjectType;
  const name = strings[values[1]];
  const id = values[2];
  const selfSize = values[3];
  const edgeCount = values[4];
  const traceNodeId = values[5];
  const detached = Boolean(values[6]);

  return {
    nodeIndex: index,
    type,
    name,
    id,
    selfSize,
    edgeCount,
    traceNodeId,
    detached,
  };
}

export function parseEdges(heapSnapshot: HeapSnapshot): Edge[] {
  const { snapshot, edges } = heapSnapshot;
  const totalEdgeCount = snapshot.edge_count;
  const edgeFields = snapshot.meta.edge_fields;
  const numOfEdgeFields = edgeFields.length;

  if (numOfEdgeFields !== NUM_OF_EDGE_FIELDS) {
    throw new Error(
      `Invalid snapshot. Expected ${NUM_OF_NODE_FIELDS} edge fields, got ${numOfEdgeFields}.`,
    );
  }
  if (edges.length % numOfEdgeFields !== 0) {
    throw new Error(
      `Invalid snapshot. Number of elements in edges is not divisible by length of edge_fields.`,
    );
  }

  const parsedEdges = [];
  for (let i = 0; i < totalEdgeCount; i++) {
    const index = i * numOfEdgeFields;
    const node = parseEdge(heapSnapshot, index, numOfEdgeFields);
    parsedEdges.push(node);
  }

  return parsedEdges;
}

export function parseEdge(
  heapSnapshot: HeapSnapshot,
  index: number,
  numOfFields: number,
): Edge {
  const { edges, strings } = heapSnapshot;
  const values = edges.slice(index, index + numOfFields);

  const type = EDGE_TYPES[0][values[0] as number] as EdgeObjectType;
  const nameOrIndex = values[1];
  const toNode = values[2] as number;

  let name;
  if (typeof nameOrIndex === "string") {
    name = nameOrIndex;
  } else {
    name = strings[nameOrIndex];
  }

  return {
    type,
    name,
    toNode,
  };
}

// TODO: what does this return?
export function buildObjectGraph(nodes: Node[], edges: Edge[]): void {}
