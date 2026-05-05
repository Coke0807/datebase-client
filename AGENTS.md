# Database Client - AI Agent 指南

> VS Code 数据库客户端扩展，支持 MySQL、PostgreSQL、Redis、MongoDB、ElasticSearch 等多种数据库。

## 快速开始

```bash
npm run dev      # 开发构建（watch 模式）
npm run build    # 生产构建
```

**VS Code 最低版本**：`^1.80.0`

## 架构概览

```
src/
├── extension.ts          # 扩展入口，注册命令和 Provider
├── model/                # 数据模型层（树节点）
│   ├── interface/node.ts # 🔑 Node 基类，所有树节点的父类
│   ├── database/         # 数据库连接节点
│   ├── main/             # 表、视图、存储过程等
│   ├── mongo/            # MongoDB 节点
│   └── redis/            # Redis 节点
├── service/              # 业务逻辑层
│   ├── serviceManager.ts # 🔑 服务管理器单例
│   ├── connectionManager.ts # 连接管理
│   └── dialect/          # 数据库方言（SQL 生成策略）
├── provider/             # VS Code API 实现
│   ├── treeDataProvider.ts
│   └── complete/         # SQL 自动补全
└── vue/                  # WebView 前端（Vue 3）
```

## 核心约定

### 1. Node 实现模式

所有树节点必须继承 `Node` 基类：

```typescript
import { Node } from "@/model/interface/node";

export class TableNode extends Node {
  constructor() {
    super();
    this.init(parent);      // 1. 初始化父节点引用
    this.cacheSelf();       // 2. 缓存自身到 ServiceManager
  }
  
  async getChildren(): Promise<Node[]> {
    // 3. 实现子节点获取逻辑
  }
}
```

**⚠️ 重要**：Node 对象存在循环引用（parent 属性），不能直接 `JSON.stringify`，使用 `NodeUtil.removeParent()` 处理。

**Node 的三层缓存体系**：
| 缓存层 | 存储位置 | 用途 |
|------|--------|------|
| 自身缓存 | `Node.nodeCache` | 快速查找节点（按 connectId 索引）|
| 子节点缓存 | `DatabaseCache.childCache` | LazyLoad，避免重复查询 |
| 状态缓存 | `DatabaseCache.elementState` | 展开/折叠状态持久化 |

### 2. 命令命名约定

```
mysql.<对象>.<动作>
```

示例：
- `mysql.table.drop` - 删除表
- `mysql.connection.add` - 添加连接
- `mysql.runSQL` - 执行 SQL

### 3. ModelType 与 contextValue

节点类型通过 `ModelType` 枚举定义，用于 `package.json` 中的菜单 `when` 条件：

```typescript
// 定义
export enum ModelType {
  TABLE = "table",
  CONNECTION = "connection",
}

// 使用
this.contextValue = ModelType.TABLE;

// package.json 菜单匹配
"when": "viewItem == table"
```

### 4. 服务获取

通过 `ServiceManager` 获取服务实例：

```typescript
const dialect = ServiceManager.getDialect(this.dbType);
const dump = ServiceManager.getDumpService(node.dbType);
const page = ServiceManager.getPageService(node.dbType);
```

### 5. SQL 方言系统

所有数据库方言继承 `SqlDialect` 基类：

```typescript
// src/service/dialect/sqlDialect.ts
export abstract class SqlDialect {
  // 安全验证（防 SQL 注入）
  protected validateIdentifier(name: string): string
  protected escapeValue(value: string): string
  
  // 核心抽象方法
  abstract showTables(database): string
  abstract showColumns(database, table): string
  abstract buildPageSql(database, table, pageSize): string
  // ...
}
```

**方言实现**：MySQL、PostgreSQL、SQLite、SQL Server、MongoDB、Elasticsearch 等。

### 6. WebView 通信

**后端 → 前端**：
```typescript
handler.emit("DATA", { data: result, fields, costTime });
```

**前端 → 后端**：
```javascript
vscode.emit("executeSQL", sql);
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 扩展后端 | TypeScript 5.9 + VS Code API 1.80+ |
| WebView 前端 | Vue 3.5 + Element Plus + VxeTable + Tailwind CSS |
| 构建工具 | Webpack 5（双入口：extension + webview） |
| 数据库驱动 | mysql2@3.x, pg, tedious, ioredis, mongodb |

## 常见陷阱

### 1. 依赖版本问题

| 依赖 | 问题 | 建议 |
|------|------|------|
| **ssh2@0.5.4** | 2017 年版本，API 不兼容最新版 | 🔴 需分阶段重构 |
| **ts-loader@7.x** | 严重滞后（最新 9.x） | 🟠 建议升级 |
| **@types/node@12.x** | 严重滞后（最新 25.x） | 🟠 建议升级 |

### 2. SQLite 依赖

Linux/macOS 需要系统安装 `sqlite3` 命令行工具。

### 3. Webpack 外部依赖

以下模块被标记为 external，不会打包：
- `vscode` - VS Code API（由宿主提供）
- `mockjs`, `mongodb-client-encryption` - 按需加载

### 4. Node polyfill

**Extension（后端）**：直接使用 Node.js 模块

**WebView（前端）**：注入 polyfill（process、buffer、stream-browserify）

### 5. TypeScript 配置

项目未启用严格模式（`strict: false`），允许隐式 any。修改时注意类型安全。

## 国际化

- 命令标题：`package.nls.json`（英文）/ `package.nls.zh-cn.json`（中文）
- 命名约定：`command.<动作>` 对应 `mysql.<动作>` 命令
- 运行 `node i18n.js` 自动生成翻译键模板

## 关键文件

| 文件 | 用途 |
|------|------|
| `src/extension.ts` | 扩展入口，命令注册 |
| `src/model/interface/node.ts` | Node 基类，树节点核心 |
| `src/service/serviceManager.ts` | 服务管理器，工厂方法 |
| `src/service/dialect/sqlDialect.ts` | SQL 方言基类 |
| `src/service/connectionManager.ts` | 连接池管理 |
| `src/provider/treeDataProvider.ts` | 树视图实现 |
| `src/common/viewManager.ts` | WebView 通信管理 |
| `webpack.config.js` | 双入口构建配置 |

## 相关文档

- [README.md](./README.md) - 项目介绍和功能说明
- [CHANGELOG.md](./CHANGELOG.md) - 版本更新日志
- [docs/](./docs/) - 迁移计划和评审报告
