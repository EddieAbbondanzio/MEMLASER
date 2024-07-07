import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "snapshots" })
export class Snapshot {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "text" })
  meta!: string;
  @Column({ type: "integer" })
  nodeCount!: number;
  @Column({ type: "integer" })
  edgeCount!: number;
  @Column({ type: "integer" })
  traceFunctionCount!: number;
}
