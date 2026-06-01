import { Node } from "../../model/interface/node";
import { spawn } from "child_process";
import * as fs from "fs";
import { Console } from "../../common/Console";
import { NodeUtil } from "../../model/nodeUtil";
import { ImportService } from "./importService";
import { sync as commandExistsSync } from 'command-exists';

export class MysqlImportService extends ImportService {

    public importSql(importPath: string, node: Node): void {

        if (commandExistsSync('mysql')) {
            NodeUtil.of(node)
            const host = node.usingSSH ? "127.0.0.1" : node.host
            const port = node.usingSSH ? NodeUtil.getTunnelPort(node.getConnectId()) : node.port;
            const args = ['-h', host, '-P', String(port), '-u', node.user];
            if (node.schema) {
                args.push(node.schema);
            }
            Console.log(`Executing: mysql -h ${host} -P ${port} -u ${node.user} -p****** ${node.schema || ""} < ${importPath}`);
            const child = spawn('mysql', args, {
                env: { ...process.env, ...(node.password ? { MYSQL_PWD: node.password } : {}) }
            });
            fs.createReadStream(importPath).pipe(child.stdin);
            child.stdout.on('data', (data) => Console.log(data.toString()));
            child.stderr.on('data', (data) => Console.log(data.toString()));
            child.on("close", (code) => {
                Console.log(code === 0 ? 'Import Done.' : "Import Occur Error!");
            })
        } else {
            super.importSql(importPath,node)
        }


    }

}