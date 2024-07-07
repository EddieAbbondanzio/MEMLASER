import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "edges" })
export class Edge {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "integer" })
  index!: number;
  @Column({ type: "integer" })
  type!: string;
  @Column({ type: "text" })
  name!: string;
  @Column({ type: "integer" })
  fromNodeId!: number;
  @Column({ type: "integer" })
  toNodeId!: number;
}
