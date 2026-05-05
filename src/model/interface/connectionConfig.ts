/**
 * 连接配置接口定义
 * 用于类型安全和代码组织
 */

import { SSHConfig } from "./sshConfig";

/**
 * 基础连接配置 - 所有数据库连接共享
 */
export interface BaseConnectionConfig {
    host: string;
    port: number;
    user?: string;
    password?: string;
    connectTimeout?: number;
    requestTimeout?: number;
    useSSL?: boolean;
    caPath?: string;
    clientCertPath?: string;
    clientKeyPath?: string;
}

/**
 * SSH 隧道配置
 */
export interface SSHConnectionConfig extends BaseConnectionConfig {
    usingSSH?: boolean;
    ssh?: SSHConfig;
}

/**
 * ElasticSearch 连接配置
 */
export interface ESConnectionConfig extends BaseConnectionConfig {
    scheme?: string;
    esAuth?: string;
    esToken?: string;
    esUrl?: string;
}

/**
 * SQLite 连接配置
 */
export interface SQLiteConnectionConfig {
    dbPath?: string;
}

/**
 * MSSQL 连接配置
 */
export interface MSSQLConnectionConfig extends BaseConnectionConfig {
    encrypt?: boolean;
    instanceName?: string;
    domain?: string;
    authType?: string;
}

/**
 * FTP 连接配置
 */
export interface FTPConnectionConfig extends BaseConnectionConfig {
    encoding?: string;
    showHidden?: boolean;
}
