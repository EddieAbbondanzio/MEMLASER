import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Node } from "./node.js";
import { EdgeType } from "../valueObjects/edge.js";
import * as util from "node:util";
import { CustomReplToString } from "@memlaser/core";

@Entity({ name: "edges" })
export class Edge implements CustomReplToString {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "integer" })
  index!: number;
  @Column({ type: "integer" })
  type!: EdgeType;
  @Column({ type: "text" })
  name!: string;
  @Column({ type: "integer" })
  @OneToOne(() => Node, n => n.id)
  fromNodeId!: number;
  @Column({ type: "integer" })
  @OneToOne(() => Node, n => n.id)
  toNodeId!: number;

  [util.inspect.custom](): string {
    return `{ id: ${this.id}, name: '${this.name}', fromNodeId: ${this.fromNodeId}, toNodeId: ${this.toNodeId}, ... }`;
  }
}
