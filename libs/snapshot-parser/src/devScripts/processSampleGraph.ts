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
import { insertNode } from "./utils.js";

export const processSampleGraph: DevScriptDefinition = {
  description: "Process sample graph (via processGraph())",
  execute: async () => {
    const db = await initializeSQLiteDB(SQLITE_IN_MEMORY);
    const nodeRepo = db.getRepository(Node);
    const edgeRepo = db.getRepository(Edge);

    // Mock heapdump has:
    // Empty object
    // Array with 3 number elements
    // Circular reference between two nested objects

    // Snapshot root. Points to GC root.
    await insertNode(db, {
      type: NodeType.Synthetic,
      name: "",
      edgeCount: 1,
    });

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

    // Circular reference. Parent -> Child <-> Child
    const circularParent = nodeRepo.create({
      id: 8,
      index: 49,
      nodeId: 15,
      type: NodeType.Object,
      name: "Object",
      edgeCount: 2,
      detached: false,
      traceNodeId: 0,
      shallowSize: 16,
      retainedSize: null,
    });
    await nodeRepo.save(circularParent);
    const child1 = nodeRepo.create({
      id: 9,
      index: 56,
      nodeId: 17,
      type: NodeType.Object,
      name: "Object",
      edgeCount: 1,
      detached: false,
      traceNodeId: 0,
      shallowSize: 16,
      retainedSize: null,
    });
    await nodeRepo.save(child1);
    const parentToChild1 = edgeRepo.create({
      id: 6,
      index: 15,
      type: EdgeType.Property,
      name: "",
      fromNodeId: circularParent.id,
      toNodeId: child1.id,
    });
    await edgeRepo.save(parentToChild1);
    const child2 = nodeRepo.create({
      id: 10,
      index: 63,
      nodeId: 17,
      type: NodeType.Object,
      name: "Object",
      edgeCount: 1,
      detached: false,
      traceNodeId: 0,
      shallowSize: 16,
      retainedSize: null,
    });
    await nodeRepo.save(child2);
    const parentToChild2 = edgeRepo.create({
      id: 7,
      index: 18,
      type: EdgeType.Property,
      name: "",
      fromNodeId: circularParent.id,
      toNodeId: child2.id,
    });
    await edgeRepo.save(parentToChild2);

    const child1ToChild2 = edgeRepo.create({
      id: 8,
      index: 21,
      type: EdgeType.Property,
      name: "",
      fromNodeId: child1.id,
      toNodeId: child2.id,
    });
    await edgeRepo.save(child1ToChild2);
    const child2ToChild1 = edgeRepo.create({
      id: 9,
      index: 24,
      type: EdgeType.Property,
      name: "",
      fromNodeId: child2.id,
      toNodeId: child1.id,
    });
    await edgeRepo.save(child2ToChild1);

    await processGraph(db);
    console.log("Done!");
  },
};
