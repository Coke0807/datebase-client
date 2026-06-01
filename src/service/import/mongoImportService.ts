import * as vscode from "vscode";
import { Console } from "@/common/Console";
import { Node } from "@/model/interface/node";
import { NodeUtil } from "@/model/nodeUtil";
import { spawn } from "child_process";
import * as fs from "fs";
import { ImportService } from "./importService";
import { sync as commandExistsSync } from 'command-exists';

export class MongoImportService extends ImportService {

    public importSql(importPath: string, node: Node): void {

        if (commandExistsSync('mongoimport')) {
            NodeUtil.of(node)
            const host = node.usingSSH ? "127.0.0.1" : node.host
            const port = node.usingSSH ? NodeUtil.getTunnelPort(node.getConnectId()) : node.port;
            const args = ['-h', `${host}:${port}`, '--db', node.database, '--jsonArray', '-c', 'identitycounters', '--type', 'json'];
            Console.log(`Executing: mongoimport -h ${host}:${port} --db ${node.database} --jsonArray -c identitycounters --type json ${importPath}`);
            const child = spawn('mongoimport', args);
            fs.createReadStream(importPath).pipe(child.stdin);
            child.stdout.on('data', (data) => Console.log(data.toString()));
            child.stderr.on('data', (data) => Console.log(data.toString()));
            child.on("close", (code) => {
                Console.log(code === 0 ? 'Import Done.' : "Import Occur Error!");
            })
        } else {
            vscode.window.showErrorMessage("Command mongoimport not found!")
        }

    }

    public filter() {
        return { json: ['json'] }
    }


}