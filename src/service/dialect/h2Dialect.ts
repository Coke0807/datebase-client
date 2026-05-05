import { SqlDialect } from "./sqlDialect";
import { CreateIndexParam } from "./param/createIndexParam";
import { UpdateTableParam } from "./param/updateTableParam";

/**
 * H2 Database SQL Dialect
 * 
 * H2 is a Java SQL database that supports standard SQL with some extensions.
 * It has compatibility modes for MySQL, PostgreSQL, Oracle, etc.
 * 
 * Reference: https://h2database.com/html/grammar.html
 */
export class H2Dialect extends SqlDialect {

    createIndex(createIndexParam: CreateIndexParam): string {
        return `CREATE INDEX ${createIndexParam.table}_idx ON ${createIndexParam.table} (${createIndexParam.column});`;
    }

    dropIndex(table: string, indexName: string): string {
        return `DROP INDEX IF EXISTS ${indexName};`;
    }

    updateColumnSql(updateColumnParam: any): string {
        const { table, column, type, nullable } = updateColumnParam;
        return `ALTER TABLE ${table} ALTER COLUMN ${column} ${type} ${nullable === 'NO' ? 'NOT NULL' : 'NULL'};`;
    }

    showIndex(database: string, table: string): string {
        return `SELECT 
            INDEX_NAME as name,
            COLUMN_NAME as column_name,
            NON_UNIQUE as non_unique
        FROM INFORMATION_SCHEMA.INDEXES 
        WHERE TABLE_SCHEMA = '${database}' AND TABLE_NAME = '${table}'
        ORDER BY INDEX_NAME, ORDINAL_POSITION;`;
    }

    showDatabases(): string {
        return `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA ORDER BY SCHEMA_NAME;`;
    }

    showSchemas(): string {
        return this.showDatabases();
    }

    showTables(database: string): string {
        return `SELECT TABLE_NAME as name 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = '${database}' AND TABLE_TYPE = 'TABLE'
        ORDER BY TABLE_NAME;`;
    }

    showViews(database: string): string {
        return `SELECT TABLE_NAME as name 
        FROM INFORMATION_SCHEMA.VIEWS 
        WHERE TABLE_SCHEMA = '${database}'
        ORDER BY TABLE_NAME;`;
    }

    showColumns(database: string, table: string): string {
        return `SELECT 
            COLUMN_NAME as name,
            DATA_TYPE as type,
            IS_NULLABLE as nullable,
            COLUMN_DEFAULT as defaultValue,
            REMARKS as comment
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${database}' AND TABLE_NAME = '${table}'
        ORDER BY ORDINAL_POSITION;`;
    }

    showTriggers(database: string): string {
        return `SELECT TRIGGER_NAME as name 
        FROM INFORMATION_SCHEMA.TRIGGERS 
        WHERE TRIGGER_SCHEMA = '${database}'
        ORDER BY TRIGGER_NAME;`;
    }

    showProcedures(database: string): string {
        return `SELECT SPECIFIC_NAME as name 
        FROM INFORMATION_SCHEMA.ROUTINES 
        WHERE ROUTINE_SCHEMA = '${database}' AND ROUTINE_TYPE = 'PROCEDURE'
        ORDER BY SPECIFIC_NAME;`;
    }

    showFunctions(database: string): string {
        return `SELECT SPECIFIC_NAME as name 
        FROM INFORMATION_SCHEMA.ROUTINES 
        WHERE ROUTINE_SCHEMA = '${database}' AND ROUTINE_TYPE = 'FUNCTION'
        ORDER BY SPECIFIC_NAME;`;
    }

    showUsers(): string {
        return `SELECT NAME as name FROM INFORMATION_SCHEMA.USERS ORDER BY NAME;`;
    }

    createUser(): string {
        return `CREATE USER username PASSWORD 'password';`;
    }

    buildPageSql(database: string, table: string, pageSize: number): string {
        return `SELECT * FROM ${database}.${table} LIMIT ${pageSize};`;
    }

    countSql(database: string, table: string): string {
        return `SELECT COUNT(*) as count FROM ${database}.${table};`;
    }

    createDatabase(database: string): string {
        return `CREATE SCHEMA IF NOT EXISTS ${database};`;
    }

    truncateDatabase(database: string): string {
        return `-- H2 does not support TRUNCATE DATABASE directly
-- Use the following to get truncate statements:
SELECT 'TRUNCATE TABLE ' || TABLE_SCHEMA || '.' || TABLE_NAME || ';' 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = '${database}' AND TABLE_TYPE = 'TABLE';`;
    }

    updateTable(update: UpdateTableParam): string {
        throw new Error("Method not implemented.");
    }

    updateColumn(table: string, column: string, type: string, comment: string, nullable: string): string {
        let sql = `ALTER TABLE ${table} ALTER COLUMN ${column} ${type}`;
        if (nullable === 'NO') {
            sql += ' NOT NULL';
        }
        if (comment) {
            sql += ` COMMENT '${comment}'`;
        }
        return sql + ';';
    }

    addColumn(table: string): string {
        return `ALTER TABLE ${table} ADD COLUMN column_name VARCHAR(255);`;
    }

    showTableSource(database: string, table: string): string {
        return `SELECT SQL as "Create Table" 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = '${database}' AND TABLE_NAME = '${table}';`;
    }

    showViewSource(database: string, table: string): string {
        return `SELECT VIEW_DEFINITION as "Create View" 
        FROM INFORMATION_SCHEMA.VIEWS 
        WHERE TABLE_SCHEMA = '${database}' AND TABLE_NAME = '${table}';`;
    }

    showProcedureSource(database: string, name: string): string {
        return `SELECT ROUTINE_DEFINITION as "Create Procedure" 
        FROM INFORMATION_SCHEMA.ROUTINES 
        WHERE ROUTINE_SCHEMA = '${database}' AND SPECIFIC_NAME = '${name}';`;
    }

    showFunctionSource(database: string, name: string): string {
        return `SELECT ROUTINE_DEFINITION as "Create Function" 
        FROM INFORMATION_SCHEMA.ROUTINES 
        WHERE ROUTINE_SCHEMA = '${database}' AND SPECIFIC_NAME = '${name}';`;
    }

    showTriggerSource(database: string, name: string): string {
        return `SELECT SQL as "Create Trigger" 
        FROM INFORMATION_SCHEMA.TRIGGERS 
        WHERE TRIGGER_SCHEMA = '${database}' AND TRIGGER_NAME = '${name}';`;
    }

    tableTemplate(): string {
        return `CREATE TABLE table_name (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
    }

    viewTemplate(): string {
        return `CREATE VIEW view_name AS
SELECT * FROM table_name
WHERE condition;`;
    }

    procedureTemplate(): string {
        return `CREATE PROCEDURE procedure_name(IN param1 VARCHAR(255))
BEGIN
    -- Procedure logic here
    SELECT * FROM table_name WHERE column = param1;
END;`;
    }

    triggerTemplate(): string {
        return `CREATE TRIGGER trigger_name
BEFORE INSERT ON table_name
FOR EACH ROW
BEGIN
    -- Trigger logic here
    SET NEW.created_at = CURRENT_TIMESTAMP;
END;`;
    }

    functionTemplate(): string {
        return `CREATE FUNCTION function_name(param1 VARCHAR(255))
RETURNS VARCHAR(255)
BEGIN
    DECLARE result VARCHAR(255);
    -- Function logic here
    SET result = CONCAT('Hello, ', param1);
    RETURN result;
END;`;
    }

    processList(): string {
        return `SELECT * FROM INFORMATION_SCHEMA.SESSIONS;`;
    }

    variableList(): string {
        return `SELECT * FROM INFORMATION_SCHEMA.SETTINGS;`;
    }

    statusList(): string {
        return `SELECT * FROM INFORMATION_SCHEMA.SETTINGS WHERE NAME LIKE '%STATUS%';`;
    }

    pingDataBase(database: string): string {
        return `SELECT 1;`;
    }
}
