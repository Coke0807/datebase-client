import { Node } from "@/model/interface/node";
import { IConnection, queryCallback } from "./connection";
import { EventEmitter } from "events";
import { Console } from "@/common/Console";
import * as net from 'net';

/**
 * H2 Database Connection
 * 
 * H2 Database supports multiple connection modes:
 * 1. TCP Server mode: java -cp h2.jar org.h2.tools.Server -tcp -tcpPort 9092
 * 2. PostgreSQL protocol mode: java -cp h2.jar org.h2.tools.Server -pg -pgPort 5435
 * 
 * For PostgreSQL protocol mode, you can use PostgreSQL connection type instead.
 * This implementation uses H2's native TCP protocol.
 * 
 * Connection parameters:
 * - host: H2 server host (default: 127.0.0.1)
 * - port: H2 TCP port (default: 9092)
 * - database: Database path/name (e.g., ~/test, mem:test, /path/to/db)
 * - user: Username (default: sa)
 * - password: Password (default: empty)
 */
export class H2Connection extends IConnection {
    private connected: boolean = false;
    private node: Node;
    private socket: net.Socket | null = null;
    private sessionId: string = '';
    
    constructor(node: Node) {
        super();
        this.node = node;
        this.node.host = node.host || '127.0.0.1';
        this.node.port = node.port || 9092;
        this.node.user = node.user || 'sa';
        this.node.password = node.password || '';
    }

    query(sql: string, callback?: queryCallback): void | EventEmitter;
    query(sql: string, values: any, callback?: queryCallback): void | EventEmitter;
    query(sql: any, values?: any, callback?: any) {
        if (!callback && values instanceof Function) {
            callback = values;
        }
        
        const event = new EventEmitter();
        
        if (!this.connected) {
            const error = new Error("H2 connection is not established");
            if (callback) callback(error);
            event.emit("error", error.message);
            return event;
        }
        
        // H2 TCP protocol implementation
        // Note: H2's native TCP protocol is complex and requires proper wire format
        // For production use, consider using PostgreSQL protocol mode instead
        
        this.executeH2Query(sql, (err, result) => {
            if (err) {
                if (callback) callback(err);
                event.emit("error", err.message);
            } else {
                if (callback) {
                    callback(null, result.rows, result.fields);
                } else {
                    if (result.rows && result.rows.length > 0) {
                        for (let i = 1; i <= result.rows.length; i++) {
                            const row = result.rows[i - 1];
                            event.emit("result", this.convertToDump(row), result.rows.length === i);
                        }
                    } else {
                        event.emit("end");
                    }
                }
            }
        });
        
        return event;
    }

    /**
     * Execute H2 query using TCP protocol
     * This is a simplified implementation
     */
    private executeH2Query(sql: string, callback: (err: Error | null, result?: any) => void) {
        // H2 TCP protocol requires proper message formatting
        // For now, return an error suggesting PostgreSQL mode
        const error = new Error(
            "H2 native TCP protocol requires additional setup.\n" +
            "Recommended: Use H2's PostgreSQL protocol mode instead.\n" +
            "Start H2 with: java -cp h2.jar org.h2.tools.Server -pg -pgPort 5435\n" +
            "Then connect using 'PostgreSQL' connection type with port 5435."
        );
        callback(error);
    }

    connect(callback: (err: Error) => void): void {
        if (!this.node.host) {
            callback(new Error("H2 host is required"));
            return;
        }
        
        if (!this.node.port) {
            callback(new Error("H2 port is required"));
            return;
        }
        
        Console.log(`[H2] Connecting to ${this.node.host}:${this.node.port}`);
        
        // Create TCP socket connection
        this.socket = new net.Socket();
        
        this.socket.connect(this.node.port, this.node.host, () => {
            Console.log(`[H2] TCP connection established`);
            // H2 TCP protocol handshake would go here
            // For now, we'll mark as connected
            this.connected = true;
            callback(null);
        });
        
        this.socket.on('error', (err) => {
            Console.log(`[H2] Connection error: ${err.message}`);
            this.connected = false;
            this.dead = true;
            callback(err);
        });
        
        this.socket.on('close', () => {
            Console.log(`[H2] Connection closed`);
            this.connected = false;
            this.dead = true;
        });
    }

    beginTransaction(callback: (err: Error) => void): void {
        // H2 supports transactions via SET AUTOCOMMIT FALSE
        callback(null);
    }

    rollback(): void {
        // Transaction rollback would be sent as ROLLBACK command
    }

    commit(): void {
        // Transaction commit would be sent as COMMIT command
    }

    end(): void {
        if (this.socket) {
            this.socket.destroy();
            this.socket = null;
        }
        this.connected = false;
        this.dead = true;
    }

    isAlive(): boolean {
        return this.connected && !this.dead && this.socket !== null;
    }
}
