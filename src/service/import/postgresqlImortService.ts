import { Console } from "@/common/Console";
import { Node } from "@/model/interface/node";
import { NodeUtil } from "@/model/nodeUtil";
import { spawn } from "child_process";
import * as fs from "fs";
import { ImportService } from "./importService";
import { sync as commandExistsSync } from 'command-exists';

export class PostgresqlImortService extends ImportService {
    public importSql(importPath: string, node: Node): void {

        if (commandExistsSync('psql')) {
            NodeUtil.of(node)
            const host = node.usingSSH ? "127.0.0.1" : node.host
            const port = node.usingSSH ? NodeUtil.getTunnelPort(node.getConnectId()) : node.port;
            const args = ['-h', host, '-p', String(port), '-U', node.user, '-d', node.database];
            Console.log(`Executing: psql -h ${host} -p ${port} -U ${node.user} -d ${node.database} < ${importPath}`);
            const child = spawn('psql', args, {
                env: { ...process.env, ...(node.password ? { PGPASSWORD: node.password } : {}) }
            });
            fs.createReadStream(importPath).pipe(child.stdin);
            child.stdout.on('data', (data) => Console.log(data.toString()));
            child.stderr.on('data', (data) => Console.log(data.toString()));
            child.on("close", (code) => {
                if (code === 0) {
                    Console.log(`Import Success!`);
                } else {
                    Console.log(`Import Occur Error!`);
                }
            })
        } else {
            super.importSql(importPath, node)
        }

    }
}