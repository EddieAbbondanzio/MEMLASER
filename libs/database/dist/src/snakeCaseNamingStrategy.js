import { DefaultNamingStrategy } from "typeorm";
import { snakeCase } from "typeorm/util/StringUtils.js";
export class SnakeCaseNamingStrategy extends DefaultNamingStrategy {
    tableName(className, customName) {
        return customName ? customName : snakeCase(className);
    }
    columnName(propertyName, customName, embeddedPrefixes) {
        return (snakeCase(embeddedPrefixes.concat("").join("_")) +
            (customName ? customName : snakeCase(propertyName)));
    }
    relationName(propertyName) {
        return snakeCase(propertyName);
    }
    joinColumnName(relationName, referencedColumnName) {
        return snakeCase(relationName + "_" + referencedColumnName);
    }
    joinTableName(firstTableName, secondTableName, firstPropertyName, _secondPropertyName) {
        return snakeCase(firstTableName +
            "_" +
            firstPropertyName.replace(/\./gi, "_") +
            "_" +
            secondTableName);
    }
    joinTableColumnName(tableName, propertyName, columnName) {
        return snakeCase(tableName + "_" + (columnName ? columnName : propertyName));
    }
    classTableInheritanceParentColumnName(parentTableName, parentTableIdPropertyName) {
        return snakeCase(parentTableName + "_" + parentTableIdPropertyName);
    }
    eagerJoinRelationAlias(alias, propertyPath) {
        return alias + "__" + propertyPath.replace(".", "_");
    }
}
//# sourceMappingURL=snakeCaseNamingStrategy.js.map