import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("snapshots")
    .addColumn("id", "integer", col => col.primaryKey())
    .addColumn("meta", "text", col => col.notNull())
    .addColumn("node_count", "integer", col => col.notNull())
    .addColumn("edge_count", "integer", col => col.notNull())
    .addColumn("trace_function_count", "integer", col => col.notNull())
    .execute();

  await db.schema
    .createTable("nodes")
    .addColumn("id", "integer", col => col.primaryKey())
    .addColumn("type", "text", col => col.notNull())
    .addColumn("name", "text", col => col.notNull())
    .addColumn("self_size", "integer", col => col.notNull())
    .addColumn("edge_count", "integer", col => col.notNull())
    .addColumn("trace_node_id", "integer", col => col.notNull())
    .addColumn("node_index", "integer", col => col.notNull())
    .addColumn("detached", "boolean", col => col.notNull())
    .addColumn("processed", "boolean", col => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .createTable("edges")
    .addColumn("id", "integer", col => col.primaryKey())
    .addColumn("type", "text", col => col.notNull())
    .addColumn("name", "text", col => col.notNull())
    .addColumn("to_node", "integer", col => col.notNull())
    .addColumn("processed", "boolean", col => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .createTable("node_edges")
    .addColumn("id", "integer", col => col.primaryKey())
    .addColumn("to_node_id", "integer", col =>
      col.references("nodes.id").onDelete("cascade").notNull(),
    )
    .addColumn("from_node_id", "integer", col =>
      col.references("nodes.id").onDelete("cascade").notNull(),
    )
    .addColumn("edge_id", "integer", col =>
      col.references("edges.id").onDelete("cascade").notNull(),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("snapshots").execute();
  await db.schema.dropTable("nodes").execute();
  await db.schema.dropTable("edges").execute();
  await db.schema.dropTable("node_edges").execute();
}
