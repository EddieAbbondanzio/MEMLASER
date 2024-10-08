import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Meta } from "../valueObjects/snapshot.js";

@Entity({ name: "snapshots" })
export class Snapshot {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "json" })
  meta!: Meta;
  @Column({ type: "integer" })
  nodeCount!: number;
  @Column({ type: "integer" })
  edgeCount!: number;
  @Column({ type: "integer" })
  traceFunctionCount!: number;
}
