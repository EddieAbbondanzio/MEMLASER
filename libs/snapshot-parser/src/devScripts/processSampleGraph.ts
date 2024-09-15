import {
  EdgeType,
  NodeType,
  SQLITE_IN_MEMORY,
  initializeSQLiteDB,
} from "@memlaser/database";
import { processGraph } from "../processing/graph.js";
import { DevScriptDefinition } from "@memlaser/core";
import { insertEdge, insertNode } from "./utils.js";

export const processSampleGraph: DevScriptDefinition = {
  description: "Process sample graph (via processGraph())",
  execute: async () => {
    const db = await initializeSQLiteDB(SQLITE_IN_MEMORY);

    // Mock heapdump has:
    // Empty object
    // Array with 3 number elements
    // Circular reference between two nested objects

    // Snapshot root. Points to GC root (amongst other things).
    const root = await insertNode(db, {
      type: NodeType.Synthetic,
      name: "",
      edgeCount: 1,
      shallowSize: 40,
    });

    // GC Root. Holds objects
    const gcRoot = await insertNode(db, {
      type: NodeType.Synthetic,
      name: "(GC roots)",
      edgeCount: 4,
    });
    await insertEdge(db, {
      type: EdgeType.Element,
      name: "",
      fromNodeId: root.id,
      toNodeId: gcRoot.id,
    });

    // Empty object
    const emptyObject = await insertNode(db, {
      type: NodeType.Object,
      name: "Object",
      shallowSize: 40,
    });
    await insertEdge(db, {
      type: EdgeType.Element,
      fromNodeId: gcRoot.id,
      toNodeId: emptyObject.id,
    });

    // Array
    const size = 3;
    const array = await insertNode(db, {
      type: NodeType.Array,
      name: "",
      edgeCount: size,
      shallowSize: 40,
    });
    for (let i = 0; i < size; i++) {
      const element = await insertNode(db, {
        type: NodeType.Number,
        name: "heap number",
        shallowSize: 16,
      });
      await insertEdge(db, {
        type: EdgeType.Element,
        name: "",
        fromNodeId: array.id,
        toNodeId: element.id,
      });
    }

    // Circular reference. Parent -> Child <-> Child
    const circularParent = await insertNode(db, {
      type: NodeType.Object,
      name: "Object",
      edgeCount: 2,
      shallowSize: 16,
    });

    const child1 = await insertNode(db, {
      type: NodeType.Object,
      name: "Object",
      edgeCount: 1,
      shallowSize: 16,
    });
    await insertEdge(db, {
      type: EdgeType.Property,
      name: "",
      fromNodeId: circularParent.id,
      toNodeId: child1.id,
    });

    const child2 = await insertNode(db, {
      type: NodeType.Object,
      name: "Object",
      edgeCount: 1,
      shallowSize: 16,
    });
    await insertEdge(db, {
      type: EdgeType.Property,
      name: "",
      fromNodeId: circularParent.id,
      toNodeId: child2.id,
    });

    await insertEdge(db, {
      type: EdgeType.Property,
      name: "",
      fromNodeId: child1.id,
      toNodeId: child2.id,
    });
    await insertEdge(db, {
      type: EdgeType.Property,
      name: "",
      fromNodeId: child2.id,
      toNodeId: child1.id,
    });

    await processGraph(db);
    console.log("Done!");
  },
};
