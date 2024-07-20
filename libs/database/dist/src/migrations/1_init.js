import { Table, TableForeignKey, } from "typeorm";
export class Init1720318566156 {
    async up(queryRunner) {
        await queryRunner.createTable(new Table({
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
        }));
        await queryRunner.createTable(new Table({
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
        }));
        await queryRunner.createTable(new Table({
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
        }));
        await queryRunner.createTable(new Table({
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
        }));
        await queryRunner.createTable(new Table({
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
                    name: "self_size",
                    type: "integer",
                    isNullable: false,
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
            ],
        }));
        await queryRunner.createTable(new Table({
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
        }));
        await queryRunner.createTable(new Table({
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
                    name: "size",
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
        }));
        await queryRunner.createForeignKey("edges", new TableForeignKey({
            columnNames: ["from_node_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "nodes",
            onDelete: "CASCADE",
        }));
        await queryRunner.createForeignKey("edges", new TableForeignKey({
            columnNames: ["to_node_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "nodes",
            onDelete: "CASCADE",
        }));
    }
    async down() {
        // Nothing to do here...
    }
}
//# sourceMappingURL=1_init.js.map