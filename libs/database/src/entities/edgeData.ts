import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "edge_data" })
export class EdgeData {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "integer" })
  index!: number;
  @Column({ type: "json" })
  fieldValues!: number[];
}
