import { UpdateTableParam } from "./param/updateTableParam";
import { SqlDialect } from "./sqlDialect";

export class SqliTeDialect extends SqlDialect{
    updateColumn(table: string, column: string, type: string, comment: string, nullable: string): string {
        throw new Error("Method not implemented.");
    }
    showIndex(database: string, table: string):string{
        const tbl = this.validateIdentifier(table);
        return `SELECT name index_name FROM sqlite_master WHERE type='index' and tbl_name='${tbl}' `;
    }
    dropIndex(table: string, indexName: string): string {
        const idx = this.validateIdentifier(indexName);
        return `DROP INDEX ${idx};`
    }
    showSchemas(): string {
        throw new Error("Method not implemented.");
    }
    showTables(database: string): string {
        return `SELECT name, type FROM sqlite_master WHERE type="table" AND name <> 'sqlite_sequence' AND name <> 'sqlite_stat1' ORDER BY type ASC, name ASC;`;
    }
    addColumn(table: string): string {
        throw new Error("Method not implemented.");
    }
    showColumns(database: string, table: string): string {
        const tbl = this.validateIdentifier(table);
        return `PRAGMA table_info(${tbl})`;
    }
    showViews(database: string): string {
        return `SELECT name, type FROM sqlite_master WHERE type="view" AND name <> 'sqlite_sequence' AND name <> 'sqlite_stat1' ORDER BY type ASC, name ASC;`;
    }
    showUsers(): string {
        throw new Error("Method not implemented.");
    }
    createUser(): string {
        throw new Error("Method not implemented.");
    }
    showTriggers(database: string): string {
        throw new Error("Method not implemented.");
    }
    showProcedures(database: string): string {
        throw new Error("Method not implemented.");
    }
    showFunctions(database: string): string {
        throw new Error("Method not implemented.");
    }
    buildPageSql(database: string, table: string, pageSize: number): string {
        const tbl = this.validateIdentifier(table);
        return `SELECT * FROM ${tbl} LIMIT ${pageSize};`;
    }
    countSql(database: string, table: string): string {
        throw new Error("Method not implemented.");
    }
    createDatabase(database: string): string {
        throw new Error("Method not implemented.");
    }
    truncateDatabase(database: string): string {
        throw new Error("Method not implemented.");
    }
    updateTable(update: UpdateTableParam): string {
        throw new Error("Method not implemented.");
    }
    showTableSource(database: string, table: string): string {
        const tbl = this.validateIdentifier(table);
        return `SELECT sql "Create Table" FROM sqlite_master where name='${tbl}' and type='table';`
    }
    showViewSource(database: string, table: string): string {
        const tbl = this.validateIdentifier(table);
        return `SELECT sql "Create View" FROM sqlite_master where name='${tbl}' and type='view';`
    }
    showProcedureSource(database: string, name: string): string {
        throw new Error("Method not implemented.");
    }
    showFunctionSource(database: string, name: string): string {
        throw new Error("Method not implemented.");
    }
    showTriggerSource(database: string, name: string): string {
        throw new Error("Method not implemented.");
    }
    tableTemplate(): string {
        return `CREATE TABLE [name](  
    id INTEGER NOT NULL primary key,
    [column] TEXT
);`
    }
    viewTemplate(): string {
        return `CREATE VIEW [name]
AS
SELECT * FROM ...;`
    }
    procedureTemplate(): string {
        throw new Error("Method not implemented.");
    }
    triggerTemplate(): string {
        throw new Error("Method not implemented.");
    }
    functionTemplate(): string {
        throw new Error("Method not implemented.");
    }
    processList(): string {
        throw new Error("Method not implemented.");
    }
    variableList(): string {
        throw new Error("Method not implemented.");
    }
    statusList(): string {
        throw new Error("Method not implemented.");
    }

}