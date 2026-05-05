/**
 * 数据库方言工厂
 * 管理数据库方言映射和创建
 */
import { DatabaseType } from "@/common/constants";
import { SqlDialect } from "./dialect/sqlDialect";
import { MysqlDialect } from "./dialect/mysqlDialect";
import { PostgreSqlDialect } from "./dialect/postgreSqlDialect";
import { SqliTeDialect } from "./dialect/sqliteDialect";
import { MssqlDIalect } from "./dialect/mssqlDIalect";

export class DialectFactory {
    private static dialects: Map<DatabaseType, SqlDialect> = new Map();

    /**
     * 获取数据库方言
     */
    static getDialect(dbType: DatabaseType): SqlDialect {
        if (!this.dialects.has(dbType)) {
            this.dialects.set(dbType, this.createDialect(dbType));
        }
        return this.dialects.get(dbType)!;
    }

    /**
     * 创建数据库方言实例
     */
    private static createDialect(dbType: DatabaseType): SqlDialect {
        switch (dbType) {
            case DatabaseType.MYSQL:
                return new MysqlDialect();
            case DatabaseType.PG:
                return new PostgreSqlDialect();
            case DatabaseType.SQLITE:
                return new SqliTeDialect();
            case DatabaseType.MSSQL:
                return new MssqlDIalect();
            default:
                throw new Error(`Unsupported database type: ${dbType}`);
        }
    }

    /**
     * 检查是否支持该数据库类型
     */
    static isSupported(dbType: DatabaseType): boolean {
        return [DatabaseType.MYSQL, DatabaseType.PG, DatabaseType.SQLITE, DatabaseType.MSSQL].includes(dbType);
    }
}
