import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class Init1720318566156 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "snapshots",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "meta",
            type: "text",
            isNullable: false,
          },
          { name: "node_count", type: "integer", isNullable: false },
          { name: "edge_count", type: "integer", isNullable: false },
          { name: "trace_function_count", type: "integer", isNullable: false },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "node_data",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "index",
            type: "integer",
            isNullable: false,
          },
          {
            name: "field_values",
            type: "text",
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "edge_data",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "index",
            type: "integer",
            isNullable: false,
          },
          {
            name: "field_values",
            type: "text",
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "strings",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "index",
            type: "integer",
            isNullable: false,
          },
          {
            name: "value",
            type: "text",
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "nodes",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "index",
            type: "integer",
            isNullable: false,
          },
          {
            name: "type",
            type: "text",
            isNullable: false,
          },
          {
            name: "name",
            type: "text",
            isNullable: false,
          },
          {
            name: "node_id",
            type: "integer",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "shallow_size",
            type: "integer",
            isNullable: false,
          },
          {
            name: "retained_size",
            type: "integer",
            // We can't calculate retained size until every edge is in the DB
            // so it has to support null.
            isNullable: true,
          },
          {
            name: "depth",
            type: "integer",
            // We can't calculate depth until every edge is in the DB
            // so it has to support null.
            isNullable: true,
          },
          {
            name: "edge_count",
            type: "integer",
            isNullable: false,
          },
          {
            name: "trace_node_id",
            type: "integer",
            isNullable: false,
          },
          {
            name: "detached",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "root",
            type: "boolean",
            // We can't calculate root nodes until we process the graph.
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "edges",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "index",
            type: "integer",
            isNullable: false,
          },
          {
            name: "type",
            type: "text",
            isNullable: false,
          },
          {
            name: "name",
            type: "text",
            isNullable: false,
          },
          {
            name: "from_node_id",
            type: "integer",
            isNullable: false,
          },
          {
            name: "to_node_id",
            type: "integer",
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "snapshot_stats",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "file_size",
            type: "integer",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "integer",
            isNullable: false,
          },
          {
            name: "imported_at",
            type: "integer",
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      "edges",
      new TableForeignKey({
        columnNames: ["from_node_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "nodes",
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "edges",
      new TableForeignKey({
        columnNames: ["to_node_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "nodes",
        onDelete: "CASCADE",
      }),
    );
  }

  async down(): Promise<void> {
    // Nothing to do here...
  }
}
