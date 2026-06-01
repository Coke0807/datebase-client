import { Node } from "@/model/interface/node";
import { IConnection, queryCallback } from "./connection";
import { EventEmitter } from "events";
import { Console } from "@/common/Console";
import { Client, ClientConfig } from "pg";

/**
 * H2 Database Connection — via PostgreSQL protocol mode.
 *
 * H2 supports a PostgreSQL-compatible wire protocol, so this class
 * delegates all communication to the `pg` driver (already a project dependency).
 *
 * Usage:
 *   1. Start H2 in PG mode:
 *      java -cp h2.jar org.h2.tools.Server -pg -pgPort 5435
 *   2. Connect with host=localhost, port=5435, user=sa, database=<path>
 *
 * Connection parameters:
 * - host: H2 server host (default: 127.0.0.1)
 * - port: H2 PG-mode port (default: 5435)
 * - database: H2 database path/name (e.g., ~/test, mem:test)
 * - user: Username (default: sa)
 * - password: Password (default: empty)
 */
export class H2Connection extends IConnection {
    private client: Client;
    private node: Node;

    constructor(node: Node) {
        super();
        this.node = node;
        this.node.host = node.host || '127.0.0.1';
        this.node.port = node.port ?? 5435;
        this.node.user = node.user || 'sa';
        this.node.password = node.password || '';

        const config: ClientConfig = {
            host: this.node.host,
            port: this.node.port as number,
            user: this.node.user,
            password: this.node.password,
            // H2 database path is passed as the "database" parameter
            database: this.node.database || 'mem:test',
            connectionTimeoutMillis: node.connectTimeout ?? 5000,
            statement_timeout: node.requestTimeout ?? 10000,
        };
        this.client = new Client(config);
    }

    query(sql: string, callback?: queryCallback): void;
    query(sql: string, values: any, callback?: queryCallback): void;
    query(sql: any, values?: any, callback?: any) {
        if (!callback && values instanceof Function) {
            callback = values;
        }

        const event = new EventEmitter();

        this.client.query(sql, (err, res) => {
            if (err) {
                if (callback) callback(err);
                event.emit("error", err.message);
            } else if (!callback) {
                if (!res.rows || res.rows.length === 0) {
                    event.emit("end");
                }
                for (let i = 1; i <= res.rows.length; i++) {
                    const row = res.rows[i - 1];
                    event.emit("result", this.convertToDump(row), res.rows.length === i);
                }
            } else {
                if (res instanceof Array) {
                    callback(null, res.map(r => this.adaptResult(r)), res.map(r => r.fields));
                } else {
                    callback(null, this.adaptResult(res), res.fields);
                }
            }
        });

        return event;
    }

    /**
     * Adapt H2 result shape to what the extension expects.
     * SELECT/SHOW → return rows array; DML → return { affectedRows }.
     */
    private adaptResult(res: any) {
        if (res.command !== 'SELECT' && res.command !== 'SHOW') {
            return { affectedRows: res.rowCount };
        }
        return res.rows;
    }

    connect(callback: (err: Error) => void): void {
        Console.log(`[H2] Connecting to ${this.node.host}:${this.node.port} (PG protocol mode)`);
        this.client.connect((err) => {
            if (err) {
                Console.log(`[H2] Connection error: ${err.message}`);
                callback(err);
            } else {
                Console.log(`[H2] Connected successfully`);
                this.client.on("error", () => this.end());
                this.client.on("end", () => this.end());
                callback(null);
            }
        });
    }

    async beginTransaction(callback: (err: Error) => void) {
        this.client.query("BEGIN", callback);
    }

    async rollback() {
        await this.client.query("ROLLBACK");
    }

    async commit() {
        await this.client.query("COMMIT");
    }

    end(): void {
        this.dead = true;
        this.client.end();
    }

    isAlive(): boolean {
        const temp = this.client as any;
        return !this.dead && temp._connected && !temp._ending && temp._queryable;
    }
}
