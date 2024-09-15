import {
  Edge,
  EdgeField,
  EdgeType,
  Node,
  NodeField,
  NodeType,
} from "@memlaser/database";
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

  nodeCount += 1;
  return await repo.save(node);
}

let edgeCount = 0;
export async function insertEdge(
  db: DataSource,
  props: DeepPartial<Edge> & { fromNodeId: number; toNodeId: number },
): Promise<Edge> {
  const repo = db.getRepository(Edge);

  let index = props?.index;
  if (index == null) {
    // Index increments by # of edge fields.
    index = edgeCount * Object.keys(EdgeField).length;
  }

  const edge = repo.create({
    // ID gets set by the DB.
    index,
    type: props?.type ?? EdgeType.Element,
    name: props?.name ?? "",
    fromNodeId: props.fromNodeId,
    toNodeId: props.toNodeId,
  });

  edgeCount += 1;
  return await repo.save(edge);
}
