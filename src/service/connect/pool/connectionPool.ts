import { EventEmitter } from "events";
import { IConnection } from "../connection";
import { IpoolConnection, pcStatus } from "./poolConnection";
import { Console } from "@/common/Console";

export abstract class ConnectionPool<T> extends IConnection {
    private connections: IpoolConnection<T>[] = [];
    private conneted: boolean;
    private waitQueue: Function[] = [];

    constructor() {
        super()
    }

    public async getConnection(callback?: (connection: IpoolConnection<T>) => void): Promise<IpoolConnection<T>> {
        for (let i = 0; i < this.connections.length; i++) {
            const connection = this.connections[i];
            if (connection && connection.status == pcStatus.FREE) {
                if (callback)
                    callback(connection)
                connection.status = pcStatus.BUSY
                return connection
            }
        }
        // Add timeout to prevent permanent hangs
        const wrappedCallback = callback;
        const timeoutId = setTimeout(() => {
            const idx = this.waitQueue.indexOf(wrapped);
            if (idx !== -1) {
                this.waitQueue.splice(idx, 1);
                Console.log('Connection pool: wait queue timeout (30s)');
                if (wrappedCallback) wrappedCallback(null);
            }
        }, 30000);
        const wrapped = (connection: IpoolConnection<T>) => {
            clearTimeout(timeoutId);
            if (wrappedCallback) wrappedCallback(connection);
        };
        this.waitQueue.push(wrapped)
        this.fill()
    }


    public isAlive(): boolean {
        return this.conneted;
    }

    public async fill() {
        this.conneted = true;
        const amount = 1
        for (let i = 0; i < amount; i++) {
            if (this.connections[i]) continue;
            const poolConnection = new IpoolConnection<T>(i, pcStatus.PEENDING);
            this.connections.push(poolConnection)
            this.createConnection(poolConnection)
        }
    }
    private createConnection(poolConnection: IpoolConnection<T>, retryCount = 0): void {
        try {
            this.newConnection((err, con) => {
                if (err) {
                    // Retry with exponential backoff, max 5 retries
                    if (retryCount < 5) {
                        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                        setTimeout(() => this.createConnection(poolConnection, retryCount + 1), delay);
                    } else {
                        Console.log(`Connection pool: failed to create connection after ${retryCount} retries`);
                    }
                    return;
                }
                poolConnection.actual = con
                if (con instanceof EventEmitter) {
                    con.on("error", () => {
                        this.endConnnection(poolConnection)
                    })
                    con.on("end", () => {
                        this.endConnnection(poolConnection)
                    })
                }
                const waiter = this.waitQueue.shift()
                if (waiter) {
                    poolConnection.status = pcStatus.BUSY
                    waiter(poolConnection)
                } else {
                    poolConnection.status = pcStatus.FREE
                }
            })
        } catch (error) {
            Console.log(`Connection pool: exception creating connection: ${error}`);
        }
    }

    protected abstract newConnection(callback: (err: Error, connection: T) => void): void;
    public release(poolConnection: IpoolConnection<T>): void {
        poolConnection.status = pcStatus.FREE
        const waiter = this.waitQueue.shift()
        if (waiter) {
            poolConnection.status = pcStatus.BUSY
            waiter(poolConnection)
        }
    }
    public endConnnection(poolConnection: IpoolConnection<T>): void {
        try {
            (poolConnection.actual as any).end();
        } catch (error) {
            Console.log(`Connection pool: error ending connection: ${error}`);
        }
        delete this.connections[poolConnection.id];
    }
    public end() {
        for (let i = 0; i < this.connections.length; i++) {
            const con = this.connections[i];
            if (con?.actual) {
                (con.actual as any).end()
            }
        }
    }
}