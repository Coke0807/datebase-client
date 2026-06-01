import * as path from "path";
import * as vscode from "vscode";
import { Global } from "../common/global";
import { Node } from "../model/interface/node";
import { QueryUnit } from "./queryUnit";
import { SSHConfig } from "../model/interface/sshConfig";
import { DatabaseCache } from "./common/databaseCache";
import { NodeUtil } from "../model/nodeUtil";
import { SSHTunnelService } from "./tunnel/sshTunnelService";
import { DbTreeDataProvider } from "../provider/treeDataProvider";
import { IConnection } from "./connect/connection";
import { DatabaseType } from "@/common/constants";
import { EsConnection } from "./connect/esConnection";
import { MSSqlConnnection } from "./connect/mssqlConnection";
import { MysqlConnection } from "./connect/mysqlConnection";
import { PostgreSqlConnection } from "./connect/postgreSqlConnection";
import { RedisConnection } from "./connect/redisConnection";
import { FTPConnection } from "./connect/ftpConnection";
import { SqliteConnection } from "./connect/sqliteConnection";
import { Console } from "@/common/Console";
import { MongoConnection } from "./connect/mongoConnection";
import { ExasolConnection } from './connect/exasolConnection';
import { H2Connection } from './connect/h2Connection';

interface ConnectionWrapper {
    connection: IConnection;
    ssh: SSHConfig;
    schema?: string;
    lastUsedAt?: number;
}

export interface GetRequest {
    retryCount?: number;
    sessionId?: string;
}

export class ConnectionManager {

    public static activeNode: Node;
    private static alivedConnection: { [key: string]: ConnectionWrapper } = {};
    private static tunnelService = new SSHTunnelService();
    private static readonly MAX_CONNECTIONS = 50;
    private static readonly IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    private static idleCheckTimer: ReturnType<typeof setInterval> | null = null;

    /**
     * Start periodic idle connection cleanup.
     * Called lazily on first getConnection().
     */
    private static ensureIdleCheckRunning() {
        if (this.idleCheckTimer) return;
        this.idleCheckTimer = setInterval(() => {
            const now = Date.now();
            for (const key of Object.keys(this.alivedConnection)) {
                const wrapper = this.alivedConnection[key];
                if (wrapper && wrapper.lastUsedAt && (now - wrapper.lastUsedAt) > this.IDLE_TIMEOUT_MS) {
                    Console.log(`ConnectionManager: closing idle connection '${key}' (idle > ${this.IDLE_TIMEOUT_MS / 60000}min)`);
                    this.end(key, wrapper);
                }
            }
        }, 5 * 60 * 1000); // check every 5 minutes
    }

    public static tryGetConnection(): Node {

        return this.getByActiveFile() || this.activeNode;
    }

    public static getActiveConnectByKey(key: string): ConnectionWrapper {
        return this.alivedConnection[key]
    }

    public static removeConnection(uid: string) {

        try {
            const lcp = this.activeNode;
            if (lcp?.getConnectId() == uid) {
                delete this.activeNode
            }
            const activeConnect = this.alivedConnection[uid];
            if (activeConnect) {
                this.end(uid, activeConnect)
            }
            DatabaseCache.clearDatabaseCache(uid)
        } catch (error) {
            Console.log(error)
        }

    }

    public static changeActive(connectionNode: Node) {
        this.activeNode = connectionNode;
        Global.updateStatusBarItems(connectionNode);
        DbTreeDataProvider.refresh()
    }

    /**
     * Clean up all active connections and SSH tunnels.
     * Called on extension deactivation.
     */
    public static cleanup() {
        if (this.idleCheckTimer) {
            clearInterval(this.idleCheckTimer);
            this.idleCheckTimer = null;
        }
        for (const key of Object.keys(this.alivedConnection)) {
            try {
                this.end(key, this.alivedConnection[key]);
            } catch (error) {
                Console.log(`ConnectionManager: error during cleanup '${key}': ${error}`);
            }
        }
        this.alivedConnection = {};
        this.activeNode = null;
    }

    public static async getConnection(connectionNode: Node, getRequest: GetRequest = { retryCount: 1 }): Promise<IConnection> {
        if (!connectionNode) {
            throw new Error("Connection is dead!")
        }
        this.ensureIdleCheckRunning();
        NodeUtil.of(connectionNode)
        if (!getRequest.retryCount) getRequest.retryCount = 1;
        const key = getRequest.sessionId || connectionNode.getConnectId();
        const connection = this.alivedConnection[key];
        if (connection) {
            if (connection.connection.isAlive()) {
                connection.lastUsedAt = Date.now();
                if (connection.schema != connectionNode.schema) {
                    const sql = connectionNode?.dialect?.pingDataBase(connectionNode.schema);
                    try {
                        if (sql) {
                            await QueryUnit.queryPromise(connection.connection, sql, false)
                        }
                        connection.schema = connectionNode.schema
                        return connection.connection;
                    } catch (err) {
                        ConnectionManager.end(key, connection);
                    }
                } else {
                    return connection.connection;
                }
            }
        }

        // Max connections limit — evict oldest idle connection if at capacity
        const activeKeys = Object.keys(this.alivedConnection);
        if (activeKeys.length >= this.MAX_CONNECTIONS) {
            let oldestKey: string | null = null;
            let oldestTime = Infinity;
            for (const k of activeKeys) {
                const w = this.alivedConnection[k];
                if (w?.lastUsedAt && w.lastUsedAt < oldestTime) {
                    oldestTime = w.lastUsedAt;
                    oldestKey = k;
                }
            }
            if (oldestKey && oldestKey !== key) {
                Console.log(`ConnectionManager: evicting idle connection '${oldestKey}' (max ${this.MAX_CONNECTIONS} reached)`);
                this.end(oldestKey, this.alivedConnection[oldestKey]);
            }
        }

        const ssh = connectionNode.ssh;
        let connectOption = connectionNode;
        if (connectOption.usingSSH) {
            connectOption = await this.tunnelService.createTunnel(connectOption, (err) => {
                if (err.errno == 'EADDRINUSE') { return; }
                this.alivedConnection[key] = null
            })
            if (!connectOption) {
                throw new Error("create ssh tunnel fail!");
            }
        }
        const newConnection = this.create(connectOption);
        this.alivedConnection[key] = { connection: newConnection, ssh, lastUsedAt: Date.now() };

        return new Promise<IConnection>((resolve, reject) => {
            newConnection.connect(async (err: Error) => {
                if (err) {
                    this.end(key, this.alivedConnection[key])
                    reject(err)
                } else {
                    try {
                        const sql = connectionNode?.dialect?.pingDataBase(connectionNode.schema);
                        if (connectionNode.schema && sql) {
                            await QueryUnit.queryPromise(newConnection, sql, false)
                        }
                    } catch (error) {
                        Console.log(error)
                    }
                    resolve(newConnection);
                }
            });
        });
    }

    private static create(opt: Node) {
        if (!opt.dbType) opt.dbType = DatabaseType.MYSQL
        switch (opt.dbType) {
            case DatabaseType.MSSQL:
                return new MSSqlConnnection(opt)
            case DatabaseType.PG:
                return new PostgreSqlConnection(opt)
            case DatabaseType.SQLITE:
                return new SqliteConnection(opt);
            case DatabaseType.ES:
                return new EsConnection(opt);
            case DatabaseType.MONGO_DB:
                return new MongoConnection(opt);
            case DatabaseType.REDIS:
                return new RedisConnection(opt);
            case DatabaseType.FTP:
                return new FTPConnection(opt);
            case DatabaseType.EXASOL:
                return new ExasolConnection(opt);
            case DatabaseType.H2:
                return new H2Connection(opt);
        }
        return new MysqlConnection(opt)
    }

    private static end(key: string, connection: ConnectionWrapper) {
        this.alivedConnection[key] = null
        try {
            this.tunnelService.closeTunnel(key)
            connection.connection.end();
        } catch (error) {
            Console.log(`ConnectionManager: error closing connection '${key}': ${error}`);
        }
    }

    public static getByActiveFile(): Node {
        if (vscode.window.activeTextEditor) {
            const fileName = vscode.window.activeTextEditor.document.fileName;
            if (fileName.includes('coke0807')) {
                const queryName = path.basename(path.resolve(fileName, '..'))
                const [host, port, database, schema] = queryName
                    .replace(/^.*@@/, '') // new connection id
                    .replace(/#.+$/, '').split('@')
                if (host != null) {
                    const node = NodeUtil.of({ key: queryName.split('@@')[0], host, port: parseInt(port), database, schema });
                    if (node.getCache()) {
                        return node.getCache();
                    }
                }
            }
        }
        return null;
    }

}
