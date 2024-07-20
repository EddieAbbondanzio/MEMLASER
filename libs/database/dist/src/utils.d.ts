import { DataSource, ObjectLiteral } from "typeorm";
export declare function initializeSQLiteDB(outputPath: string): Promise<DataSource>;
export declare function batchSelectAll<T extends ObjectLiteral>(db: DataSource, table: new () => T, orderBy: keyof T, batchSize: number): AsyncGenerator<T[], void, void>;
//# sourceMappingURL=utils.d.ts.map