import { Edge, Node, NodeField, NodeType } from "@memlaser/database";
import { DataSource, DeepPartial } from "typeorm";

let nodeCount = 0;
export async function insertNode(
  db: DataSource,
  props?: DeepPartial<Node>,
): Promise<Node> {
  const repo = db.getRepository(Node);

  let index = props?.index;
  if (index == null) {
    // Index increments by # of node fields.
    index = nodeCount * Object.keys(NodeField).length;
  }
  let nodeId = props?.nodeId;
  if (nodeId == null) {
    // Node ID is always odd for some reason.
    nodeId = (nodeCount + 1) * 2 - 1;
  }

  const node = repo.create({
    // ID gets set by the DB.
    index,
    nodeId,
    type: props?.type ?? NodeType.Synthetic,
    name: props?.name ?? "",
    edgeCount: props?.edgeCount ?? 0,
    detached: props?.detached ?? false,
    traceNodeId: props?.traceNodeId ?? 0,
    shallowSize: props?.shallowSize ?? 0,
    retainedSize: props?.retainedSize ?? null,
  });

  // There may be some gotchas here since we always increment nodeCount because
  // it technically will leave unused indices and nodeIds. Prob doesn't matter?
  nodeCount += 1;
  return await repo.save(node);
}

export async function insertEdge(
  _db: DataSource,
  _props: DeepPartial<Edge>,
): Promise<Edge> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return null as any;
}
