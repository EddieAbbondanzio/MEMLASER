import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "snapshot_stats" })
export class SnapshotStats {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "integer" })
  fileSize!: number;
  @Column({ type: "datetime" })
  createdAt!: Date;
  @Column({ type: "datetime" })
  importedAt!: Date;
}
