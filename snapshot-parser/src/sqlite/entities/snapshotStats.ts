import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { MetaJSON } from "../../json/schema.js";

@Entity({ name: "snapshot_stats" })
export class SnapshotStats {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "integer" })
  size!: number;
  @Column({ type: "datetime" })
  createdAt!: Date;
  @Column({ type: "datetime" })
  importedAt!: Date;
}
