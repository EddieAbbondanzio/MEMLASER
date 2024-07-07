import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { MetaJSON } from "../../json/schema";

@Entity({ name: "snapshots" })
export class Snapshot {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "json" })
  meta!: MetaJSON;
  @Column({ type: "integer" })
  nodeCount!: number;
  @Column({ type: "integer" })
  edgeCount!: number;
  @Column({ type: "integer" })
  traceFunctionCount!: number;
}
