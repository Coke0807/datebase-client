import * as fs from "fs";
import { Node } from "@/model/interface/node";
import { MongoClient, MongoClientOptions, ObjectId as MObjectId } from "mongodb";
import { IConnection, queryCallback } from "./connection";

export class MongoConnection extends IConnection {
    private conneted: boolean;
    private client: MongoClient;
    private option: MongoClientOptions;

    /** C-01: Whitelisted MongoDB driver methods — blocks arbitrary code execution via eval() */
    private static readonly ALLOWED_METHODS = new Set([
        'db', 'collection', 'find', 'findOne', 'insertOne', 'insertMany',
        'updateOne', 'updateMany', 'deleteOne', 'deleteMany',
        'aggregate', 'countDocuments', 'distinct', 'drop', 'createIndex',
        'listCollections', 'stats', 'renameCollection', 'findOneAndUpdate',
        'findOneAndDelete', 'findOneAndReplace', 'bulkWrite',
        'toArray', 'limit', 'skip', 'sort', 'project', 'count',
        'next', 'forEach', 'map', 'dropDatabase', 'dropCollection',
        'createCollection', 'indexes', 'indexExists', 'indexInformation',
    ]);

    /** Patterns that must never appear in a MongoDB query expression */
    private static readonly DANGEROUS_PATTERNS = [
        /\bprocess\b/, /\brequire\b/, /\bglobalThis\b/,
        /\beval\b/, /\bFunction\b/, /\b__proto__\b/,
        /\bchild_process\b/, /\bnew\s+Function/,
        /\bnew\s+RegExp/, /\bsetImmediate\b/,
    ];

    constructor(private node: Node) {
        super()
        this.option = {
            connectTimeoutMS: this.node.connectTimeout ?? 5000, waitQueueTimeoutMS: this.node.requestTimeout,
            ssl: this.node.useSSL, sslValidate: false,
            sslCert: (node.clientCertPath) ? fs.readFileSync(node.clientCertPath) : null,
            sslKey: (node.clientKeyPath) ? fs.readFileSync(node.clientKeyPath) : null,
        } as MongoClientOptions;
    }

    /**
     * C-01: Safe MongoDB query execution — validates method chain against whitelist
     * instead of using raw eval(). Uses new Function() which has no local scope access.
     */
    private async safeExecute(sql: string): Promise<any> {
        // 1. Block dangerous patterns
        for (const pattern of MongoConnection.DANGEROUS_PATTERNS) {
            if (pattern.test(sql)) {
                throw new Error(`MongoDB query contains forbidden pattern: ${pattern.source}`);
            }
        }

        // 2. Validate all method names in the chain are whitelisted
        const methodPattern = /\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
        let match: RegExpExecArray;
        while ((match = methodPattern.exec(sql)) !== null) {
            if (!MongoConnection.ALLOWED_METHODS.has(match[1])) {
                throw new Error(`MongoDB method '${match[1]}' is not allowed. Only whitelisted driver methods can be executed.`);
            }
        }

        // 3. Ensure expression is a simple method chain (no statements)
        // Only block semicolons (statement separators), not = inside object literals
        if (/;/.test(sql.replace(/['"][^'"]*['"]/g, ''))) {
            throw new Error('MongoDB query must be a single method chain expression');
        }

        // 4. Execute via new Function — no access to local scope, only 'client' param
        const normalizedSql = sql.startsWith('.') ? sql : '.' + sql;
        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
        const fn = new AsyncFunction('client', `"use strict"; return client${normalizedSql};`);
        return await fn(this.client);
    }

    connect(callback: (err: Error) => void): void {
        let url=this.node.connectionUrl;
        if (!url) {
          url = `mongodb://${this.node.host}:${this.node.port}`;
          if (this.node.user || this.node.password) {
            const escapedUser = encodeURIComponent(this.node.user)
            const escapedPassword = encodeURIComponent(this.node.password)
            url = `mongodb://${escapedUser}:${escapedPassword}@${this.node.host}:${this.node.port}`;
          }
        }
        MongoClient.connect(url, this.option)
          .then((client) => {
            this.client = client;
            this.conneted = true;
            callback(null);
          })
          .catch((err) => {
            callback(err);
          });
      }

    run(callback: (client: MongoClient) => void) {

        callback(this.client)
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
        return this.conneted && this.client !== null;
    }

    query(sql: string, callback?: queryCallback): void;
    query(sql: string, values: any, callback?: queryCallback): void;
    async query(sql: any, values?: any, callback?: any) {
        if (!callback && values instanceof Function) {
            callback = values;
        }
        if (sql == 'show dbs') {
            this.client.db().admin().listDatabases().then((res) => {
                callback(null, res.databases.map((db: any) => ({ Database: db.name })))
                console.log(res)
            })
        } else {
            try {
                const result = await this.safeExecute(sql)
                if (result == null) {
                    callback(null)
                } else if (Number.isInteger(result)) {
                    callback(null, result)
                } else if (result.insertedCount != undefined) {
                    callback(null, { affectedRows: result.insertedCount })
                } else if (result.updatedCount != undefined) {
                    callback(null, { affectedRows: result.updatedCount })
                } else if (result.deletedCount != undefined) {
                    callback(null, { affectedRows: result.deletedCount })
                } else {
                    this.handleSearch(sql, result, callback)
                }
            } catch (error) {
                callback(error)
            }
        }
    }



    private async handleSearch(sql: any, data: any, callback: any) {
        let fields = null;

        let rows = data.map((document: any) => {
            if (!fields) {
                fields = [];
                for (const key in document) {
                    fields.push({ name: key, type: 'text', nullable: 'YES' });
                }
            }
            let row = {};
            for (const key in document) {
                row[key] = document[key];
                if (row[key] instanceof MObjectId) {
                    row[key] = `ObjectID('${row[key]}')`;
                } else if (row[key] instanceof Object) {
                    row[key] = JSON.stringify(row[key]);
                }
            }
            return row;
        });
        // if (!fields) {
        //     const indexName = path.split('/')[1];
        //     const indexNode = Node.nodeCache[`${this.opt.getConnectId()}_${indexName}`] as Node;
        //     fields = (await indexNode?.getChildren())?.map((node: any) => { return { name: node.label, type: node.type, nullable: 'YES' }; }) as any;
        // }
        callback(null, rows, fields || []);
    }

}

function ObjectID(objectId: string) {
    return new MObjectId(objectId)
}