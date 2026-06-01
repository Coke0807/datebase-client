import { Console } from "@/common/Console";
import { Node } from "@/model/interface/node";
import { TableNode } from "@/model/main/tableNode";
import { ViewNode } from "@/model/main/viewNode";
import { NodeUtil } from "@/model/nodeUtil";
import { DumpService } from "./dumpService";
import * as vscode from "vscode";
import { spawn } from "child_process";
import * as fs from "fs";
import { sync as commandExistsSync } from 'command-exists';

export class MysqlDumpService extends DumpService {

    public async dump(node: Node, withData: boolean) {

        /**
         * https://dev.mysql.com/doc/refman/5.7/en/mysqldump.html
         */
        if (commandExistsSync('mysqldump')) {
            const folderPath = await this.triggerSave(node);
            if (folderPath) {
                NodeUtil.of(node)
                const isTable = node instanceof TableNode || node instanceof ViewNode;
                const host = node.usingSSH ? "127.0.0.1" : node.host
                const port = node.usingSSH ? NodeUtil.getTunnelPort(node.getConnectId()) : node.port;
                const tables = isTable ? ` --skip-triggers ${node.label}` : '';
                const args = ['-h', host, '-P', String(port), '-u', node.user, '--skip-add-locks'];
                if (!withData) args.push('--no-data');
                if (isTable) {
                    args.push('--skip-triggers', String(node.label));
                }
                args.push(node.schema);
                const logCmd = `mysqldump -h ${host} -P ${port} -u ${node.user} -p****** --skip-add-locks ${node.schema} ${tables}`;
                Console.log(`Executing: ${logCmd}`);
                await new Promise<void>((resolve, reject) => {
                    const child = spawn('mysqldump', args, {
                        env: { ...process.env, ...(node.password ? { MYSQL_PWD: node.password } : {}) }
                    });
                    const outStream = fs.createWriteStream(folderPath.fsPath);
                    child.stdout.pipe(outStream);
                    child.stderr.on('data', (data) => Console.log(data.toString()));
                    child.on('error', (err) => reject(err));
                    child.on('close', (code) => {
                        if (code === 0) {
                            resolve();
                        } else {
                            reject(new Error(`mysqldump exited with code ${code}`));
                        }
                    });
                });
                vscode.window.showInformationMessage(`Backup ${node.getHost()}_${node.schema} success!`, 'open').then(action => {
                    if (action === 'open') {
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(folderPath.fsPath));
                    }
                });
            }
            return Promise.reject("Dump canceled.");
        }

        return super.dump(node, withData);
    }

}