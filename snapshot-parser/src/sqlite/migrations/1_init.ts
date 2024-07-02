import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("snapshots")
    .addColumn("id", "integer", col => col.primaryKey().autoIncrement())
    .addColumn("meta", "text", col => col.notNull())
    .addColumn("node_count", "integer", col => col.notNull())
    .addColumn("edge_count", "integer", col => col.notNull())
    .addColumn("trace_function_count", "integer", col => col.notNull())
    .execute();

  await db.schema
    .createTable("node_data")
    .addColumn("id", "integer", col => col.primaryKey().autoIncrement())
    .addColumn("index", "integer", col => col.notNull())
    .addColumn("field_values", "text", col => col.notNull())
    .execute();

  await db.schema
    .createTable("edge_data")
    .addColumn("id", "integer", col => col.primaryKey().autoIncrement())
    .addColumn("index", "integer", col => col.notNull())
    .addColumn("field_values", "text", col => col.notNull())
    .execute();

  await db.schema
    .createTable("strings")
    .addColumn("id", "integer", col => col.primaryKey().autoIncrement())
    .addColumn("index", "integer", col => col.notNull())
    .addColumn("value", "text", col => col.notNull())
    .execute();

  await db.schema
    .createTable("nodes")
    .addColumn("id", "integer", col => col.primaryKey().autoIncrement())
    .addColumn("index", "integer", col => col.notNull())
    .addColumn("type", "text", col => col.notNull())
    .addColumn("name", "text", col => col.notNull())
    .addColumn("node_id", "integer", col => col.notNull().unique())
    .addColumn("self_size", "integer", col => col.notNull())
    .addColumn("edge_count", "integer", col => col.notNull())
    .addColumn("trace_node_id", "integer", col => col.notNull())
    .addColumn("detached", "boolean", col => col.notNull())
    .execute();

  await db.schema
    .createTable("edges")
    .addColumn("id", "integer", col => col.primaryKey().autoIncrement())
    .addColumn("index", "integer", col => col.notNull())
    .addColumn("type", "text", col => col.notNull())
    .addColumn("name", "text", col => col.notNull())
    .addColumn("from_node_id", "integer", col => col.notNull())
    .addColumn("to_node_id", "integer", col => col.notNull())
    .addForeignKeyConstraint(
      "from_node_foreign_key",
      ["from_node_id"],
      "nodes",
      ["id"],
    )
    .addForeignKeyConstraint("to_node_foreign_key", ["to_node_id"], "nodes", [
      "id",
    ])
    .execute();
}
