import { DefaultNamingStrategy, NamingStrategyInterface } from "typeorm";
export declare class SnakeCaseNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
    tableName(className: string, customName: string): string;
    columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string;
    relationName(propertyName: string): string;
    joinColumnName(relationName: string, referencedColumnName: string): string;
    joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string, _secondPropertyName: string): string;
    joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string;
    classTableInheritanceParentColumnName(parentTableName: string, parentTableIdPropertyName: string): string;
    eagerJoinRelationAlias(alias: string, propertyPath: string): string;
}
//# sourceMappingURL=snakeCaseNamingStrategy.d.ts.map