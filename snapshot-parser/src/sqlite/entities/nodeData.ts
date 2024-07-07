import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "node_data" })
export class NodeData {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "integer" })
  index!: number;
  @Column({ type: "text" })
  fieldValues!: string;
}
