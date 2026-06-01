import { CreateIndexParam } from "./param/createIndexParam";
import { UpdateColumnParam } from "./param/updateColumnParam";
import { UpdateTableParam } from "./param/updateTableParam";
import { SqlDialect } from "./sqlDialect";

export class MysqlDialect extends SqlDialect {
    createIndex(createIndexParam: CreateIndexParam): string {
        const tbl = this.validateIdentifier(createIndexParam.table);
        const col = this.validateIdentifier(createIndexParam.column);
        return `ALTER TABLE ${tbl} ADD ${createIndexParam.type} (${col})`;
    }
    dropIndex(table: string, indexName: string): string {
        const tbl = this.validateIdentifier(table);
        const idx = this.validateIdentifier(indexName);
        return `ALTER TABLE ${tbl} DROP INDEX ${idx}`
    }
    showIndex(database: string, table: string): string {
        const db = this.validateIdentifier(database);
        const tbl = this.validateIdentifier(table);
        return `SELECT column_name,index_name,non_unique,index_type FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema='${db}' and table_name='${tbl}';`
    }
    variableList(): string {
        return 'show global VARIABLES'
    }
    statusList(): string {
        return 'show global status'
    }
    processList(): string {
        return 'show processlist'
    }
    addColumn(table: string): string {
        const tbl = this.validateIdentifier(table);
        return `ALTER TABLE
        ${tbl} 
    ADD 
        COLUMN [column] [type] NOT NULL comment '';`;
    }
    createUser(): string {
        return `CREATE USER 'username'@'%' IDENTIFIED BY 'password';`;
    }
    updateColumn(table: string, column: string, type: string, comment: string, nullable: string): string {
        const tbl = this.validateIdentifier(table);
        const col = this.validateIdentifier(column);
        const defaultDefinition = nullable == "YES" ? "" : " NOT NULL";
        const safeComment = comment ? ` comment '${this.escapeValue(comment)}'` : "";
        return `ALTER TABLE\n\t${tbl} CHANGE ${col} ${col} ${type}${defaultDefinition}${safeComment};`;
    }
    updateColumnSql(updateColumnParam: UpdateColumnParam): string {
        let {columnName,columnType,newColumnName,comment,nullable,table}=updateColumnParam
        const tbl = this.validateIdentifier(table);
        const col = this.validateIdentifier(columnName);
        const newCol = this.validateIdentifier(newColumnName);
        const defaultDefinition = nullable ? "" : " NOT NULL";
        const safeComment = comment ? ` comment '${this.escapeValue(comment)}'` : "";
        return `ALTER TABLE\n\t${tbl} CHANGE ${col} ${newCol} ${columnType}${defaultDefinition}${safeComment};`;
    }
    showUsers(): string {
        return `SELECT concat(user,'@',host) user FROM mysql.user;`;
    }
    pingDataBase(database: string): string {
        if (!database) {
            // mysql not using connection poll, so need ping connnection active.
            return "select 1";
        }
        const db = this.validateIdentifier(database);
        return `use \`${db}\``;
    }
    updateTable(update: UpdateTableParam): string {
        const { table, newTableName, comment, newComment } = update
        const tbl = this.validateIdentifier(table);
        let sql = "";
        if (newComment && newComment != comment) {
            sql = `ALTER TABLE ${tbl} COMMENT = '${this.escapeValue(newComment)}';`;
        }
        if (newTableName && table != newTableName) {
            const newTbl = this.validateIdentifier(newTableName);
            sql += `ALTER TABLE ${tbl} RENAME TO ${newTbl};`
        }
        return sql;
    }
    truncateDatabase(database: string): string {
        const db = this.validateIdentifier(database);
        return `SELECT Concat('TRUNCATE TABLE \`',table_schema,'\`.\`',TABLE_NAME, '\`;') trun FROM INFORMATION_SCHEMA.TABLES where  table_schema ='${db}' and TABLE_TYPE<>'VIEW';`
    }
    createDatabase(database: string): string {
        const db = this.validateIdentifier(database);
        return `create database \`${db}\` default character set = 'utf8mb4' `;
    }
    showTableSource(database: string, table: string): string {
        const db = this.validateIdentifier(database);
        const tbl = this.validateIdentifier(table);
        return `SHOW CREATE TABLE \`${db}\`.\`${tbl}\`;`
    }
    showViewSource(database: string, table: string): string {
        const db = this.validateIdentifier(database);
        const tbl = this.validateIdentifier(table);
        return `SHOW CREATE VIEW  \`${db}\`.\`${tbl}\`;`
    }
    showProcedureSource(database: string, name: string): string {
        const db = this.validateIdentifier(database);
        const n = this.validateIdentifier(name);
        return `SHOW CREATE PROCEDURE \`${db}\`.\`${n}\`;`
    }
    showFunctionSource(database: string, name: string): string {
        const db = this.validateIdentifier(database);
        const n = this.validateIdentifier(name);
        return `SHOW CREATE FUNCTION \`${db}\`.\`${n}\`;`;
    }
    showTriggerSource(database: string, name: string): string {
        const db = this.validateIdentifier(database);
        const n = this.validateIdentifier(name);
        return `SHOW CREATE TRIGGER \`${db}\`.\`${n}\`;`;
    }
    showColumns(database: string, table: string): string {
        const db = this.validateIdentifier(database);
        const tbl = this.validateIdentifier(table);
        return `SELECT COLUMN_NAME name,DATA_TYPE simpleType,COLUMN_TYPE type,COLUMN_COMMENT comment,COLUMN_KEY \`key\`,IS_NULLABLE nullable,CHARACTER_MAXIMUM_LENGTH maxLength,COLUMN_DEFAULT defaultValue,EXTRA extra FROM information_schema.columns WHERE table_schema = '${db}' AND table_name = '${tbl}' ORDER BY ORDINAL_POSITION;`;
    }
    showTriggers(database: string): string {
        const db = this.validateIdentifier(database);
        return `SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = '${db}'`;
    }
    showProcedures(database: string): string {
        const db = this.validateIdentifier(database);
        return `SELECT ROUTINE_NAME FROM information_schema.routines WHERE ROUTINE_SCHEMA = '${db}' and ROUTINE_TYPE='PROCEDURE'`;
    }
    showFunctions(database: string): string {
        const db = this.validateIdentifier(database);
        return `SELECT ROUTINE_NAME FROM information_schema.routines WHERE ROUTINE_SCHEMA = '${db}' and ROUTINE_TYPE='FUNCTION'`;
    }
    showViews(database: string): string {
        const db = this.validateIdentifier(database);
        return `SELECT TABLE_NAME name FROM information_schema.VIEWS  WHERE TABLE_SCHEMA = '${db}'`;
    }
    buildPageSql(database: string, table: string, pageSize: number): string {
        const tbl = this.validateIdentifier(table);
        return `SELECT * FROM ${tbl} LIMIT ${pageSize};`;
    }
    countSql(database: string, table: string): string {
        const tbl = this.validateIdentifier(table);
        return `SELECT count(*) FROM ${tbl};`;
    }
    showTables(database: string): string {
        const db = this.validateIdentifier(database);
        return `SELECT table_comment \`comment\`,TABLE_NAME as \`name\`,TABLE_ROWS \`rows\`,auto_increment,\`row_format\`,data_length,index_length FROM information_schema.TABLES  WHERE TABLE_SCHEMA = '${db}' and TABLE_TYPE<>'VIEW' order by table_name;`
    }
    showSchemas(): string {
        return "show databases"
    }
    tableTemplate(): string {
        return `CREATE TABLE [name](  
    id int NOT NULL primary key AUTO_INCREMENT comment 'primary key',
    create_time DATETIME COMMENT 'create time',
    update_time DATETIME COMMENT 'update time',
    [column] varchar(255) comment ''
) default charset utf8 comment '';`
    }
    viewTemplate(): string {
        return `CREATE VIEW [name]
AS
(SELECT * FROM ...);`
    }
    procedureTemplate(): string {
        return `CREATE PROCEDURE [name]()
BEGIN

END;`;
    }
    triggerTemplate(): string {
        return `CREATE TRIGGER [name] 
[BEFORE/AFTER] [INSERT/UPDATE/DELETE]
ON [table]
FOR EACH ROW BEGIN

END;`
    }
    functionTemplate(): string {
        return `CREATE FUNCTION [name]() RETURNS [TYPE]
BEGIN
    return [value];
END;`
    }
}
