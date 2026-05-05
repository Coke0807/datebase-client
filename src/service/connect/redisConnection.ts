import { Node } from "@/model/interface/node";
import { IConnection, queryCallback } from "./connection";
import * as fs from "fs";
import Redis, { RedisOptions } from "ioredis";

export class RedisConnection extends IConnection {
    private conneted: boolean;
    private client: Redis;
    constructor(node: Node) {
        super()
        let config: RedisOptions = {
            port: node.port,
            host: node.host,
            password: node.password,
            connectTimeout: node.connectTimeout ?? 5000,
            db: node.database as any as number,
            family: 4,
        };
        if(node.useSSL){
            config.tls={
                rejectUnauthorized: false,
                ca: (node.caPath) ? fs.readFileSync(node.caPath) : null,
                cert: ( node.clientCertPath) ? fs.readFileSync(node.clientCertPath) : null,
                key: ( node.clientKeyPath) ? fs.readFileSync(node.clientKeyPath) : null,
                minVersion: 'TLSv1'
            }
        }
        this.client = new Redis(config);


    }
    query(sql: string, callback?: queryCallback): void;
    query(sql: string, values: any, callback?: queryCallback): void;
    query(sql: any, values?: any, callback?: any) {
        const param: string[] = sql.replace(/ +/g, " ").split(' ')
        const command = param.shift()
        this.client.sendCommand(new Redis.Command(command, param, { replyEncoding: 'utf-8' }), callback)
    }
    run(callback: (client: Redis) => void) {

        callback(this.client)
    }

    connect(callback: (err: Error) => void): void {
        let timeout = true;
        setTimeout(() => {
            if (timeout) {
                timeout = false;
                callback(new Error("Connect to redis server time out."))
            }
        }, 5000);
        this.client.ping((err) => {
            if (timeout) {
                this.conneted = true;
                timeout = false;
                callback(err)
            }
        })
    }
    beginTransaction(callback: (err: Error) => void): void {
    }
    rollback(): void {
    }
    commit(): void {
    }
    end(): void {
    }
    isAlive(): boolean {
        return this.conneted;
    }

}