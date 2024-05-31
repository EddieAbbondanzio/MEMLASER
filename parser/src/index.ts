import * as fs from "fs";

// https://learn.microsoft.com/en-us/microsoft-edge/devtools-guide-chromium/memory-problems/heap-snapshot-schema

const NUM_OF_NODE_FIELDS = 7;

interface HeapSnapshot {
  snapshot: Snapshot;
  nodes: number[];
  edges: number[];
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
  edge_fields: string[];
  edge_types: string[];
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
  type: ObjectType;
  name: string;
  id: number;
  selfSize: number;
  edgeCount: number;
  traceNodeId: number;
  detached: boolean;
}
type ObjectType = keyof NodeTypes[0];

async function main(): Promise<void> {
  console.log(process.cwd());
  const rawContent = await fs.promises.readFile("samples/reddit.heapsnapshot");
  const rawSnapshot: HeapSnapshot = JSON.parse(rawContent.toString());

  parseNodes(rawSnapshot);
}
void main();

export function parseNodes(heapSnapshot: HeapSnapshot): Node[] {
  const { snapshot, nodes } = heapSnapshot;
  const totalNodeCount = snapshot.node_count;
  const nodeFields = snapshot.meta.node_fields;
  const numOfNodeFields = nodeFields.length;

  if (numOfNodeFields !== NUM_OF_NODE_FIELDS) {
    throw new Error(
      `Unexpected number of node fields. Expected ${NUM_OF_NODE_FIELDS}, got ${numOfNodeFields}`,
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

  const type = NODE_TYPES[0][values[0]] as ObjectType;
  const name = strings[values[1]];
  const id = values[2];
  const selfSize = values[3];
  const edgeCount = values[4];
  const traceNodeId = values[5];
  const detached = Boolean(values[6]);

  return {
    type,
    name,
    id,
    selfSize,
    edgeCount,
    traceNodeId,
    detached,
  };
}
