import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { NodeType } from "../valueObjects/node.js";

@Entity({ name: "nodes" })
export class Node {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "integer" })
  index!: number;
  @Column({ type: "text" })
  type!: NodeType;
  @Column({ type: "text" })
  name!: string;
  @Column({ type: "integer" })
  nodeId!: number;
  @Column({ type: "integer" })
  shallowSize!: number;
  @Column({ type: "integer", nullable: true })
  retainedSize!: number | null;
  @Column({ type: "integer", nullable: true })
  depth!: number | null;
  @Column({ type: "integer" })
  edgeCount!: number;
  @Column({ type: "integer" })
  traceNodeId!: number;
  @Column({ type: "integer" })
  detached!: boolean;
}
