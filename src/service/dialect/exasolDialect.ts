import { SqlDialect } from "./sqlDialect";
import { CreateIndexParam } from "./param/createIndexParam";

export class ExasolDialect extends SqlDialect {
    createIndex(createIndexParam: CreateIndexParam): string {
        const tbl = this.validateIdentifier(createIndexParam.table);
        const col = this.validateIdentifier(createIndexParam.column);
        return `CREATE INDEX ${tbl}_idx ON ${tbl} (${col});`;
    }

    showVersion(): string {
        return "SELECT PARAM_VALUE FROM SYS.EXA_PARAMETERS WHERE PARAM_NAME = 'databaseProductVersion';";
    }

    showDatabases(): string {
        return "SELECT SCHEMA_NAME FROM SYS.EXA_SCHEMAS ORDER BY SCHEMA_NAME;";
    }

    showSchemas(): string {
        return this.showDatabases();
    }

    showTables(database: string): string {
        const db = this.validateIdentifier(database);
        return `SELECT TABLE_NAME FROM SYS.EXA_ALL_TABLES WHERE TABLE_SCHEMA = '${db}' ORDER BY TABLE_NAME;`;
    }

    showViews(database: string): string {
        const db = this.validateIdentifier(database);
        return `SELECT VIEW_NAME FROM SYS.EXA_ALL_VIEWS WHERE VIEW_SCHEMA = '${db}' ORDER BY VIEW_NAME;`;
    }

    showColumns(database: string, table: string): string {
        const db = this.validateIdentifier(database);
        const tbl = this.validateIdentifier(table);
        return `SELECT 
            COLUMN_NAME AS "name",
            COLUMN_TYPE AS "type",
            COLUMN_TYPE AS "simpleType"
        FROM SYS.EXA_ALL_COLUMNS 
        WHERE COLUMN_SCHEMA = '${db}' 
        AND COLUMN_TABLE = '${tbl}' 
        ORDER BY COLUMN_ORDINAL_POSITION;`;
    }

    showTriggers(database: string): string {
        const db = this.validateIdentifier(database);
        return `SELECT TRIGGER_NAME FROM SYS.EXA_ALL_TRIGGERS WHERE TRIGGER_SCHEMA = '${db}' ORDER BY TRIGGER_NAME;`;
    }

    showProcedures(database: string): string {
        const db = this.validateIdentifier(database);
        return `SELECT PROCEDURE_NAME FROM SYS.EXA_ALL_PROCEDURES WHERE PROCEDURE_SCHEMA = '${db}' ORDER BY PROCEDURE_NAME;`;
    }

    showFunctions(database: string): string {
        const db = this.validateIdentifier(database);
        return `SELECT FUNCTION_NAME FROM SYS.EXA_ALL_FUNCTIONS WHERE FUNCTION_SCHEMA = '${db}' ORDER BY FUNCTION_NAME;`;
    }

    tableTemplate(): string {
        return `CREATE TABLE table_name (
    id INTEGER IDENTITY PRIMARY KEY,
    name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
    }

    viewTemplate(): string {
        return `CREATE VIEW view_name AS
SELECT * FROM table_name
WHERE condition;`;
    }

    procedureTemplate(): string {
        return `CREATE PROCEDURE procedure_name(IN param1 INTEGER)
AS
BEGIN
    -- Procedure logic here
END;`;
    }

    functionTemplate(): string {
        return `CREATE FUNCTION function_name(param1 INTEGER)
RETURNS INTEGER AS
BEGIN
    -- Function logic here
    RETURN 0;
END;`;
    }

    triggerTemplate(): string {
        return `CREATE TRIGGER trigger_name
BEFORE INSERT ON table_name
FOR EACH ROW
BEGIN
    -- Trigger logic here
END;`;
    }

    showUsers(): string {
        return "SELECT USER_NAME FROM SYS.EXA_ALL_USERS ORDER BY USER_NAME;";
    }

    userTemplate(): string {
        return `CREATE USER user_name IDENTIFIED BY 'password';`;
    }

    truncateDatabase(database: string): string {
        const db = this.validateIdentifier(database);
        return `SELECT 'TRUNCATE TABLE ' || TABLE_SCHEMA || '.' || TABLE_NAME || ';' 
        FROM SYS.EXA_ALL_TABLES 
        WHERE TABLE_SCHEMA = '${db}';`;
    }

    createUser(): string {
        return `CREATE USER user_name IDENTIFIED BY 'password';`;
    }

    updateUser(): string {
        return `ALTER USER user_name IDENTIFIED BY 'new_password';`;
    }

    grantPrivileges(): string {
        return `GRANT privileges ON schema_name.* TO user_name;`;
    }

    updateColumn(): string {
        return `ALTER TABLE table_name MODIFY column_name column_type;`;
    }

    addColumn(): string {
        return `ALTER TABLE table_name ADD column_name column_type;`;
    }

    buildPageSql(database: string, table: string, pageSize: number): string {
        const db = this.validateIdentifier(database);
        const tbl = this.validateIdentifier(table);
        return `SELECT * FROM "${db}"."${tbl}" LIMIT 1000`;
    }

    countSql(database: string, table: string): string {
        const db = this.validateIdentifier(database);
        const tbl = this.validateIdentifier(table);
        return `SELECT COUNT(1) as count FROM "${db}"."${tbl}"`;
    }

    updateTable(): string {
        return `ALTER TABLE old_table_name RENAME TO new_table_name`;
    }

    showTableSource(database: string, table: string): string {
        const db = this.validateIdentifier(database);
        const tbl = this.validateIdentifier(table);
        return `SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT,
            CASE WHEN COLUMN_IS_NULLABLE = 'YES' THEN 'NULL' ELSE 'NOT NULL' END as nullable,
            COLUMN_COMMENT
        FROM SYS.EXA_ALL_COLUMNS
        WHERE COLUMN_SCHEMA = '${db}'
        AND COLUMN_TABLE = '${tbl}'
        ORDER BY COLUMN_ORDINAL_POSITION`;
    }

    showViewSource(database: string, view: string): string {
        const db = this.validateIdentifier(database);
        const vw = this.validateIdentifier(view);
        return `SELECT VIEW_TEXT
        FROM SYS.EXA_ALL_VIEWS
        WHERE VIEW_SCHEMA = '${db}'
        AND VIEW_NAME = '${vw}'`;
    }

    showProcedureSource(database: string, procedure: string): string {
        const db = this.validateIdentifier(database);
        const proc = this.validateIdentifier(procedure);
        return `SELECT PROCEDURE_TEXT
        FROM SYS.EXA_ALL_PROCEDURES
        WHERE PROCEDURE_SCHEMA = '${db}'
        AND PROCEDURE_NAME = '${proc}'`;
    }

    showFunctionSource(database: string, function_name: string): string {
        const db = this.validateIdentifier(database);
        const fn = this.validateIdentifier(function_name);
        return `SELECT FUNCTION_TEXT
        FROM SYS.EXA_ALL_FUNCTIONS
        WHERE FUNCTION_SCHEMA = '${db}'
        AND FUNCTION_NAME = '${fn}'`;
    }

    showTriggerSource(database: string, trigger: string): string {
        const db = this.validateIdentifier(database);
        const trg = this.validateIdentifier(trigger);
        return `SELECT TRIGGER_TEXT
        FROM SYS.EXA_ALL_TRIGGERS
        WHERE TRIGGER_SCHEMA = '${db}'
        AND TRIGGER_NAME = '${trg}'`;
    }

    showVariables(): string {
        return `SELECT PARAM_NAME, PARAM_VALUE 
        FROM SYS.EXA_PARAMETERS 
        ORDER BY PARAM_NAME`;
    }

    showStatus(): string {
        return `SELECT 'RUNNING' as status, 
            current_timestamp as server_time, 
            current_schema as current_database`;
    }

    processList(): string {
        return `SELECT SESSION_ID, USER_NAME, ACTIVITY, COMMAND_NAME, DURATION 
        FROM SYS.EXA_DBA_SESSIONS 
        WHERE STATUS = 'RUNNING'`;
    }

    variableList(): string {
        return this.showVariables();
    }

    statusList(): string {
        return this.showStatus();
    }

    createDatabase(): string {
        return `CREATE SCHEMA schema_name`;
    }
}