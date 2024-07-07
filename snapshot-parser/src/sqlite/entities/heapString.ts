import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "strings" })
export class HeapString {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "integer" })
  index!: number;

  @Column({ type: "text" })
  value!: string;
}
