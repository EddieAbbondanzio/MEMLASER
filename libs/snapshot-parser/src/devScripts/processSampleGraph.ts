import {
  Edge,
  EdgeType,
  Node,
  NodeType,
  SQLITE_IN_MEMORY,
  initializeSQLiteDB,
} from "@memlaser/database";
import { processGraph } from "../processing/graph.js";
import { DevScriptDefinition } from "@memlaser/core";

export const processSampleGraph: DevScriptDefinition = {
  description: "Process sample graph (via processGraph())",
  execute: async () => {
    const db = await initializeSQLiteDB(SQLITE_IN_MEMORY);
    const nodeRepo = db.getRepository(Node);
    const edgeRepo = db.getRepository(Edge);

    // Mock heapdump has:
    // Empty object
    // Array with 3 number elements
    // Circular reference between some nested objects

    // Snapshot root. Points to GC root.
    const root = nodeRepo.create({
      id: 1,
      index: 0,
      nodeId: 1,
      type: NodeType.Synthetic,
      name: "",
      edgeCount: 1,
      detached: false,
      traceNodeId: 0,
      shallowSize: 0,
      retainedSize: null,
    });
    await nodeRepo.save(root);

    // Holds objects
    const gcRoot = nodeRepo.create({
      id: 2,
      index: 7,
      nodeId: 3,
      type: NodeType.Synthetic,
      name: "(GC roots)",
      edgeCount: 4,
      detached: false,
      traceNodeId: 0,
      shallowSize: 0,
      retainedSize: null,
    });
    await nodeRepo.save(gcRoot);
    const rootToGCRootEdge = edgeRepo.create({
      id: 1,
      index: 0,
      type: EdgeType.Element,
      name: "",
      fromNodeId: 1,
      toNodeId: 2,
    });
    await edgeRepo.save(rootToGCRootEdge);

    // Empty object
    const emptyObject = nodeRepo.create({
      id: 3,
      index: 14,
      nodeId: 5,
      type: NodeType.Object,
      name: "Object",
      // Objects never have an edgeCount of 0, but we are simplifying for
      // testing purposes.
      edgeCount: 0,
      detached: false,
      traceNodeId: 0,
      shallowSize: 80,
      retainedSize: null,
    });
    await nodeRepo.save(emptyObject);
    const gcRootToEmptyObject = edgeRepo.create({
      id: 2,
      index: 3,
      type: EdgeType.Property,
      name: "",
      fromNodeId: 1,
      toNodeId: 2,
    });
    await edgeRepo.save(gcRootToEmptyObject);

    // Array
    const array = nodeRepo.create({
      id: 4,
      index: 21,
      nodeId: 7,
      type: NodeType.Array,
      name: "",
      edgeCount: 3,
      detached: false,
      traceNodeId: 0,
      shallowSize: 16,
      retainedSize: null,
    });
    await nodeRepo.save(array);

    const element1 = nodeRepo.create({
      id: 5,
      index: 28,
      nodeId: 9,
      type: NodeType.Number,
      name: "heap number",
      // Numbers will never have an edgeCount of 0 but we are simplifying for
      // testing purposes.
      edgeCount: 0,
      detached: false,
      traceNodeId: 0,
      shallowSize: 16,
      retainedSize: null,
    });
    await nodeRepo.save(element1);
    const arrayToElement1 = edgeRepo.create({
      id: 3,
      index: 6,
      type: EdgeType.Element,
      name: "",
      fromNodeId: array.id,
      toNodeId: element1.id,
    });
    await edgeRepo.save(arrayToElement1);

    const element2 = nodeRepo.create({
      id: 6,
      index: 35,
      nodeId: 11,
      type: NodeType.Number,
      name: "heap number",
      // Numbers will never have an edgeCount of 0 but we are simplifying for
      // testing purposes.
      edgeCount: 0,
      detached: false,
      traceNodeId: 0,
      shallowSize: 16,
      retainedSize: null,
    });
    await nodeRepo.save(element2);
    const arrayToElement2 = edgeRepo.create({
      id: 4,
      index: 9,
      type: EdgeType.Element,
      name: "",
      fromNodeId: array.id,
      toNodeId: element2.id,
    });
    await edgeRepo.save(arrayToElement2);

    const element3 = nodeRepo.create({
      id: 7,
      index: 42,
      nodeId: 13,
      type: NodeType.Number,
      name: "heap number",
      // Numbers will never have an edgeCount of 0 but we are simplifying for
      // testing purposes.
      edgeCount: 0,
      detached: false,
      traceNodeId: 0,
      shallowSize: 16,
      retainedSize: null,
    });
    await nodeRepo.save(element2);
    const arrayToElement3 = edgeRepo.create({
      id: 5,
      index: 12,
      type: EdgeType.Element,
      name: "",
      fromNodeId: array.id,
      toNodeId: element3.id,
    });
    await edgeRepo.save(arrayToElement3);

    // Circular reference
    // TODO: Add one! Do 3 objects. Parent -> child <-> child

    await processGraph(db);
    console.log("Done!");
  },
};
