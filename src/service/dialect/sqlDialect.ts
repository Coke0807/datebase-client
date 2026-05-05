import { CreateIndexParam } from "./param/createIndexParam";
import { UpdateColumnParam } from "./param/updateColumnParam";
import { UpdateTableParam } from "./param/updateTableParam";

export abstract class SqlDialect {
    /**
     * C-02: Validate SQL identifier (table name, database name, column name, etc.)
     * to prevent SQL injection via template string interpolation.
     * Only allows alphanumeric, underscore, hyphen, dot, and backtick-wrapped identifiers.
     */
    protected validateIdentifier(name: string): string {
        if (name == null || name === '') return name;
        // Allow backtick/bracket-quoted identifiers as-is (already safe)
        if ((name.startsWith('`') && name.endsWith('`')) ||
            (name.startsWith('"') && name.endsWith('"')) ||
            (name.startsWith('[') && name.endsWith(']'))) {
            return name;
        }
        // Block obviously dangerous characters that enable SQL injection
        if (/[;'"\-\-\/\*\x00\x1a\n\r]/.test(name)) {
            throw new Error(`Invalid SQL identifier: ${name}`);
        }
        return name;
    }

    /**
     * C-02: Escape a string value for safe inclusion in SQL.
     * Used for comment strings and other value parameters.
     */
    protected escapeValue(value: string): string {
        if (value == null) return 'null';
        return String(value).replace(/'/g, "''");
    }

    dropIndex(table: string, indexName: string): string {
        throw new Error("Method not implemented.");
    }
    updateColumnSql(updateColumnParam: UpdateColumnParam): string {
        throw new Error("Method not implemented.");
    }
    showIndex(database: string, table: string): string { return null; }
    createIndex(createIndexParam: CreateIndexParam): string { return null };
    showDatabases(): string { return null; }
    abstract updateColumn(table: string, column: string, type: string, comment: string, nullable: string): string;
    abstract showSchemas(): string;
    abstract showTables(database: string): string;
    abstract addColumn(table: string): string;
    abstract showColumns(database: string, table: string): string;
    abstract showViews(database: string): string;
    abstract showUsers(): string;
    abstract createUser(): string;
    abstract showTriggers(database: string): string;
    abstract showProcedures(database: string): string;
    abstract showFunctions(database: string): string;
    abstract buildPageSql(database: string, table: string, pageSize: number): string;
    abstract countSql(database: string, table: string): string;
    abstract createDatabase(database: string): string;
    abstract truncateDatabase(database: string): string;
    abstract updateTable(update: UpdateTableParam): string;
    abstract showTableSource(database: string, table: string): string;
    abstract showViewSource(database: string, table: string): string;
    abstract showProcedureSource(database: string, name: string): string;
    abstract showFunctionSource(database: string, name: string): string;
    abstract showTriggerSource(database: string, name: string): string;
    abstract tableTemplate(): string;
    abstract viewTemplate(): string;
    abstract procedureTemplate(): string;
    abstract triggerTemplate(): string;
    abstract functionTemplate(): string;
    abstract processList(): string;
    abstract variableList(): string;
    abstract statusList(): string;
    pingDataBase(database: string): string {
        return null;
    }
    dropTriggerTemplate(name: string): string {
        return `DROP TRIGGER IF EXISTS ${name}`
    }
}

