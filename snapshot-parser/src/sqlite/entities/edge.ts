import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Node } from "./node";
import { EdgeType } from "../../json/schema";

@Entity({ name: "edges" })
export class Edge {
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
}
