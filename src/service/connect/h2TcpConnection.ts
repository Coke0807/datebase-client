/**
 * H2 Database Connection — via native TCP protocol mode.
 *
 * Wraps H2TcpClient (pure TypeScript binary protocol) in the IConnection
 * interface so it can be used by the existing connection manager.
 *
 * Usage:
 *   1. Start H2 TCP server:
 *      java -cp h2.jar org.h2.tools.Server -tcp -tcpPort 9092
 *   2. Connect with host=localhost, port=9092, user=sa, database=<path>
 *
 * Connection parameters:
 * - host: H2 server host (default: 127.0.0.1)
 * - port: H2 TCP-mode port (default: 9092)
 * - database: H2 database path/name (e.g., ~/test, mem:test)
 * - user: Username (default: sa)
 * - password: Password (default: empty)
 */

import { Node } from "@/model/interface/node";
import { IConnection, queryCallback } from "./connection";
import { EventEmitter } from "events";
import { Console } from "@/common/Console";
import { H2TcpClient, ColumnMeta } from "./h2TcpClient";
import { FieldInfo, Types } from "@/common/typeDef";

export class H2TcpConnection extends IConnection {
    private client: H2TcpClient;
    private node: Node;

    constructor(node: Node) {
        super();
        this.node = node;
        this.node.host = node.host || '127.0.0.1';
        this.node.port = node.port ?? 9092;
        this.node.user = node.user || 'sa';
        this.node.password = node.password || '';

        this.client = new H2TcpClient(this.node.host, this.node.port as number);
    }

    query(sql: string, callback?: queryCallback): void;
    query(sql: string, values: any, callback?: queryCallback): void;
    query(sql: any, values?: any, callback?: any) {
        if (!callback && values instanceof Function) {
            callback = values;
        }

        const event = new EventEmitter();

        this.executeSql(sql).then((result) => {
            if (result.isQuery) {
                // SELECT-style → emit rows
                const fields = result.columns.map(c => this.toFieldInfo(c));
                if (!callback) {
                    if (!result.rows || result.rows.length === 0) {
                        event.emit("end");
                    }
                    for (let i = 0; i < result.rows.length; i++) {
                        const row = this.rowToObject(result.rows[i], result.columns);
                        event.emit("result", this.convertToDump(row), i === result.rows.length - 1);
                    }
                } else {
                    const rows = result.rows.map(r => this.rowToObject(r, result.columns));
                    callback(null, rows, fields);
                }
            } else {
                // DML → affected rows
                const affected = (result as { isQuery: false; affectedRows: number }).affectedRows;
                if (!callback) {
                    event.emit("result", { affectedRows: affected }, true);
                    event.emit("end");
                } else {
                    callback(null, { affectedRows: affected }, []);
                }
            }
        }).catch((err) => {
            if (callback) callback(err);
            event.emit("error", err.message);
        });

        return event;
    }

    connect(callback: (err: Error) => void): void {
        const database = this.node.database || 'mem:test';
        Console.log(`[H2-TCP] Connecting to ${this.node.host}:${this.node.port} db=${database}`);

        this.client.connect(database, this.node.user, this.node.password).then(() => {
            Console.log(`[H2-TCP] Connected successfully`);
            callback(null);
        }).catch((err) => {
            Console.log(`[H2-TCP] Connection error: ${err.message}`);
            callback(err);
        });
    }

    async beginTransaction(callback: (err: Error) => void) {
        try {
            await this.client.executeUpdate("BEGIN");
            callback(null);
        } catch (err) {
            callback(err as Error);
        }
    }

    async rollback() {
        await this.client.executeUpdate("ROLLBACK");
    }

    async commit() {
        await this.client.executeUpdate("COMMIT");
    }

    end(): void {
        this.dead = true;
        this.client.close();
    }

    isAlive(): boolean {
        return !this.dead && !this.client.isClosed();
    }

    // ── Private Helpers ──────────────────────────────────────────────────

    private async executeSql(sql: string): Promise<
        | { isQuery: true; columns: ColumnMeta[]; rows: any[][] }
        | { isQuery: false; affectedRows: number }
    > {
        if (this.isQuery(sql)) {
            const result = await this.client.executeQuery(sql);
            return { isQuery: true, ...result };
        } else {
            const affectedRows = await this.client.executeUpdate(sql);
            return { isQuery: false, affectedRows };
        }
    }

    /** Determine if a SQL statement should use query (SELECT) or update path. */
    private isQuery(sql: string): boolean {
        const trimmed = sql.trim().toUpperCase();
        return (
            trimmed.startsWith('SELECT') ||
            trimmed.startsWith('SHOW') ||
            trimmed.startsWith('EXPLAIN') ||
            trimmed.startsWith('WITH') ||
            trimmed.startsWith('TABLE') ||
            trimmed.startsWith('VALUES')
        );
    }

    /** Convert a positional row array into a column-name-keyed object. */
    private rowToObject(row: any[], columns: ColumnMeta[]): Record<string, any> {
        const obj: Record<string, any> = {};
        for (let i = 0; i < columns.length; i++) {
            obj[columns[i].name] = row[i];
        }
        return obj;
    }

    /** Map H2 column metadata to the extension's FieldInfo format. */
    private toFieldInfo(col: ColumnMeta): FieldInfo {
        return {
            catalog: '',
            db: this.node.database || '',
            schema: '',
            table: '',
            orgTable: '',
            name: col.name,
            orgName: col.name,
            charsetNr: 33,  // utf8
            length: col.precision,
            flags: 0,
            decimals: col.scale,
            zeroFill: false,
            protocol41: true,
            type: this.mapH2Type(col.valueType),
        };
    }

    /** Map H2 value type constant → MySQL-style Types enum. */
    private mapH2Type(vt: number): Types {
        switch (vt) {
            case 0:  return Types.NULL;        // VT_NULL
            case 1:  return Types.TINY;        // VT_BOOLEAN (stored as 0/1)
            case 2:  return Types.TINY;        // VT_TINYINT
            case 3:  return Types.SHORT;       // VT_SMALLINT
            case 4:  return Types.LONG;        // VT_INTEGER
            case 5:  return Types.LONGLONG;    // VT_BIGINT
            case 6:  return Types.NEWDECIMAL;  // VT_NUMERIC
            case 7:  return Types.DOUBLE;      // VT_DOUBLE
            case 8:  return Types.FLOAT;       // VT_REAL
            case 9:  return Types.TIME;        // VT_TIME
            case 10: return Types.TIME;        // VT_TIME_TZ
            case 11: return Types.DATE;        // VT_DATE
            case 12: return Types.TIMESTAMP;   // VT_TIMESTAMP
            case 13: return Types.TIMESTAMP;   // VT_TIMESTAMP_TZ
            case 14: return Types.BLOB;        // VT_BYTES
            case 15: return Types.VAR_STRING;  // VT_STRING
            case 16: return Types.VAR_STRING;  // VT_STRING_IGNORECASE
            case 17: return Types.BLOB;        // VT_BLOB
            case 18: return Types.BLOB;        // VT_CLOB
            case 24: return Types.VAR_STRING;  // VT_CHAR
            case 25: return Types.JSON;        // VT_JSON
            default: return Types.VAR_STRING;
        }
    }
}
