import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "nodes" })
export class Node {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "integer" })
  index!: number;
  @Column({ type: "text" })
  type!: string;
  @Column({ type: "text" })
  name!: string;
  @Column({ type: "integer" })
  nodeId!: number;
  @Column({ type: "integer" })
  selfSize!: number;
  @Column({ type: "integer" })
  edgeCount!: number;
  @Column({ type: "integer" })
  traceNodeId!: number;
  @Column({ type: "integer" })
  detached!: boolean;
}