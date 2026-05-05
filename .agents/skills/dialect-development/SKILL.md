# Database Client - Dialect Development Skill

> 数据库方言开发专用指南，用于添加新数据库支持或修改现有方言实现。

## 触发条件

- 修改 `src/service/dialect/` 目录下的文件
- 添加新的数据库类型支持
- 修改 SQL 生成逻辑
- 涉及 `DatabaseType` 枚举

## 方言架构

### 基类接口

```typescript
// src/service/dialect/sqlDialect.ts
export abstract class SqlDialect {
  // 🔒 安全验证（必须使用）
  protected validateIdentifier(name: string): string
  protected escapeValue(value: string): string
  
  // 📋 核心抽象方法（必须实现）
  abstract showSchemas(): string
  abstract showTables(database): string
  abstract showColumns(database, table): string
  abstract showViews(database): string
  abstract showUsers(): string
  abstract showTriggers(database): string
  abstract showProcedures(database): string
  abstract buildPageSql(database, table, pageSize): string
  abstract countSql(database, table): string
  abstract createDatabase(database): string
  abstract updateTable(update): string
  abstract updateColumn(table, column, type, comment, nullable): string
  
  // 🔧 可选方法（有默认实现）
  dropTriggerTemplate(name): string
  dropIndex(table, indexName): string
  createIndex(param): string
}
```

### 实现约定

1. **所有 SQL 标识符必须通过 `validateIdentifier()` 验证**
2. **所有值必须通过 `escapeValue()` 转义**
3. **不支持的方法应抛出异常或返回空字符串**

## 添加新数据库类型

### 步骤 1：定义数据库类型

```typescript
// src/common/constants.ts
export enum DatabaseType {
  // 现有类型...
  NEW_DB = "newDb",
}
```

### 步骤 2：创建方言类

```typescript
// src/service/dialect/newDbDialect.ts
import { SqlDialect } from "./sqlDialect";

export class NewDbDialect extends SqlDialect {
  showTables(database: string): string {
    const db = this.validateIdentifier(database);
    return `SELECT table_name FROM information_schema.tables WHERE table_schema = '${db}'`;
  }
  
  showColumns(database: string, table: string): string {
    const db = this.validateIdentifier(database);
    const tbl = this.validateIdentifier(table);
    return `SELECT column_name, data_type FROM information_schema.columns 
            WHERE table_schema = '${db}' AND table_name = '${tbl}'`;
  }
  
  // 实现其他抽象方法...
}
```

### 步骤 3：注册到 ServiceManager

```typescript
// src/service/serviceManager.ts
public static getDialect(dbType: DatabaseType): SqlDialect {
  switch (dbType) {
    // 现有类型...
    case DatabaseType.NEW_DB:
      return new NewDbDialect();
  }
  return new MysqlDialect();
}
```

### 步骤 4：添加连接节点

```typescript
// src/model/database/connectionNode.ts
// 添加新数据库的连接逻辑
```

### 步骤 5：添加前端支持

```typescript
// src/vue/connect/ - 连接表单
// 添加新数据库的连接配置 UI
```

## 现有方言特点

| 数据库 | 实现类 | 特点 |
|------|------|------|
| MySQL | `MysqlDialect` | 完整实现，支持索引、变量、进程管理 |
| PostgreSQL | `PostgreSqlDialect` | 完整实现，支持高级状态查询 |
| SQLite | `SqliTeDialect` | 轻量级实现，依赖系统命令 |
| SQL Server | `MssqlDIalect` | SQL Server 专用语法 |
| MongoDB | `MongoDialect` | 非关系型，大部分方法抛异常 |
| Elasticsearch | `EsDialect` | REST API 驱动，返回空字符串 |

## 安全规范

### SQL 注入防护

```typescript
// ✅ 正确
showTables(database: string): string {
  const db = this.validateIdentifier(database);
  return `SHOW TABLES FROM ${db}`;
}

// ❌ 错误
showTables(database: string): string {
  return `SHOW TABLES FROM ${database}`;  // 直接拼接，有注入风险
}
```

### 标识符验证

`validateIdentifier()` 会：
1. 检查是否包含危险字符（`;`, `'`, `"`, `--`, `/*`）
2. 移除前后空格
3. 验证长度限制

## 测试

### 单元测试

```typescript
// tests/dialect/newDbDialect.test.ts
import { NewDbDialect } from "@/service/dialect/newDbDialect";

describe("NewDbDialect", () => {
  const dialect = new NewDbDialect();
  
  it("should generate showTables SQL", () => {
    const sql = dialect.showTables("mydb");
    expect(sql).toContain("mydb");
  });
  
  it("should prevent SQL injection", () => {
    expect(() => dialect.showTables("db; DROP TABLE users;"))
      .toThrow();
  });
});
```

### 集成测试

1. 添加测试连接配置
2. 验证连接、查询、DDL 操作
3. 测试分页、导出等功能

## 常见问题

### 1. 方言方法返回空字符串

某些数据库（如 Elasticsearch）使用 REST API 而非 SQL，方言方法返回空字符串，实际实现在 `PageService` 中。

### 2. MongoDB 特殊处理

MongoDB 是非关系型数据库，大部分 SQL 方法不适用。方言类仅实现 `showDatabases()`，其他操作在 `MongoPageService` 中实现。

### 3. 分页语法差异

不同数据库的分页语法不同：
- MySQL: `LIMIT offset, count`
- PostgreSQL: `LIMIT count OFFSET offset`
- SQL Server: `OFFSET offset ROWS FETCH NEXT count ROWS ONLY`

在 `buildPageSql()` 中实现对应语法。
