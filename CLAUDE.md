# Database Client (vscode-database-client)

## 1. 项目概述
- **项目定位与核心功能**: VS Code 多数据库客户端扩展，支持 MySQL、PostgreSQL、MongoDB、Redis、Elasticsearch、SQL Server、SQLite 等多种数据源的连接管理、查询执行、数据导入导出、结构同步等功能
- **目标用户与使用场景**: 开发者在 VS Code 中直接管理数据库，无需切换到独立数据库客户端工具，适合日常开发调试、数据查询、数据库运维场景
- **技术栈与依赖环境**: 
  - 核心语言/版本: TypeScript 5.9+ (target ES2020)
  - 运行时环境: Node.js (VS Code Extension Host)
  - 核心框架: Vue 3.5+ (WebView UI)、Element Plus 2.13+ (UI 组件)
  - 关键依赖: mysql2、pg、mongodb、ioredis、ssh2、axios、vxe-table、xterm
- **快速开始指南**: 
  ```bash
  pnpm install          # 安装依赖
  pnpm run dev          # 开发模式（Watch 构建）
  # 按 F5 启动调试，VS Code 将打开扩展开发宿主
  ```

## 2. 目录结构
- **关键目录说明**:
  ```
  database-client/
  ├─ src/                      # 核心源代码
  │  ├─ extension.ts           # 【入口】VS Code 扩展激活点
  │  ├─ common/                # 共享工具层（常量、类型、工具函数、状态管理）
  │  ├─ model/                 # 数据模型层（树节点体系）
  │  │  ├─ interface/          # 抽象基类 Node、连接配置接口
  │  │  ├─ database/           # 数据库连接节点
  │  │  ├─ main/               # SQL 对象节点（表、视图、函数、存储过程、触发器）
  │  │  ├─ redis/              # Redis 节点
  │  │  ├─ mongo/              # MongoDB 节点
  │  │  ├─ es/                 # Elasticsearch 节点
  │  │  ├─ ftp/                # FTP 连接节点
  │  │  └─ ssh/                # SSH 连接节点
  │  ├─ service/               # 业务服务层（方言、连接、查询、导入导出）
  │  │  ├─ dialect/            # 数据库方言实现（策略模式）
  │  │  ├─ connect/            # 连接处理与连接池
  │  │  ├─ page/               # 分页查询服务
  │  │  ├─ export/             # 数据导出服务
  │  │  ├─ import/             # 数据导入服务
  │  │  ├─ dump/               # 数据库备份
  │  │  ├─ diff/               # 结构对比
  │  │  └─ ssh/                # SSH 隧道
  │  ├─ provider/              # VS Code Provider 实现
  │  │  ├─ treeDataProvider.ts # TreeView 数据提供者
  │  │  ├─ complete/           # SQL 自动补全
  │  │  ├─ codelen/            # Code Lens
  │  │  └─ parser/             # SQL 解析
  │  └─ vue/                   # WebView 前端（Vue 3）
  ├─ public/                   # 静态资源（HTML、主题、字体）
  ├─ resources/                # 扩展资源（图标、图片、SSH 配置）
  ├─ syntaxes/                 # 语言配置（TextMate Grammar、代码片段）
  ├─ tests/                    # 集成测试与安全审计
  ├─ docs/                     # 项目文档（任务计划、审查报告）
  └─ types/                    # TypeScript 类型定义
  ```
- **文件组织方式**: 按职责分层（Model-Service-Provider），每个数据源有独立的 model 和 service 子目录
- **配置文件位置**: 
  - `package.json` - 扩展配置、命令、依赖
  - `tsconfig.json` - TypeScript 配置
  - `webpack.config.js` - 构建配置（Extension + WebView）
  - `tailwind.config.js` - CSS 框架配置
- **资源文件位置**: 
  - `public/theme/` - CSS 主题
  - `resources/icon/` - 图标资源
  - `syntaxes/` - 语言语法配置

## 3. 开发规范
- **代码风格与格式要求**: 
  - TypeScript 配置 `strict: false`（兼容存量代码）
  - 使用 Tailwind CSS 进行样式开发
  - Vue 单文件组件（SFC）用于 WebView UI
  - 缺少 ESLint/Prettier 配置，建议后续添加
- **命名规范与约定**: 
  - 文件名：小驼峰（如 `connectionNode.ts`）
  - 类名：大驼峰（如 `MysqlDialect`）
  - 接口：大驼峰，可带 `I` 前缀（如 `Node`）
  - 方言类后缀：`Dialect`、`Connection`、`PageService`
- **Git 提交规范**: 
  - 未配置 commitlint，建议遵循 Conventional Commits
  - 推荐格式：`type(scope): description`
  - 示例：`feat(mysql): add connection pool support`
- **安全注意事项**: 
  - ⚠️ **Critical**: MongoDB `eval()` 存在 RCE 漏洞，禁止直接执行用户输入
  - ⚠️ **Critical**: SQL 拼接存在注入风险，必须使用参数化查询
  - 敏感信息（密码、密钥）通过 VS Code SecretStorage 管理
  - `.env` 文件已在 `.gitignore` 中，禁止提交敏感配置

## 4. 常用命令
- **安装和启动命令**: 
  ```bash
  pnpm install              # 安装依赖
  pnpm run dev              # 开发构建（Watch 模式）
  pnpm run build            # 生产构建
  ```
- **测试和检查命令**: 
  ```bash
  node tests/integration/phase1.test.js   # 运行集成测试
  ```
- **构建和部署命令**: 
  ```bash
  pnpm run lib              # 库文件构建
  pnpm run vscode:prepublish  # 发布前预处理
  pnpm run publich          # 发布到 VS Code 市场（注意：脚本名有 typo）
  ```
- **环境变量配置**: 
  | 变量名 | 说明 | 示例 |
  |--------|------|------|
  | `NODE_ENV` | 运行环境 | `development` / `production` |
  | `VSCE_TOKEN` | VS Code 市场发布令牌 | `vsce_...` |

## 5. 技术决策
- **架构设计原因**: 
  - **三层架构**（Model-Service-Provider）：分离数据模型、业务逻辑和 VS Code 集成，便于维护和测试
  - **策略模式**（Dialect）：每种数据库实现独立方言类，支持扩展新数据源
  - **WebView + Vue 3**：复杂 UI（查询结果、表设计）使用 WebView 实现，比原生 VS Code UI 更灵活
- **技术选型理由**: 
  - **Webpack 5**：支持持久化缓存，提升构建速度
  - **Vue 3 + Element Plus**：成熟的 UI 组件库，适合数据密集型界面
  - **vxe-table**：高性能表格组件，支持大数据量渲染
  - **xterm**：终端模拟器，支持 SSH 连接的命令行交互
- **重要设计模式**: 
  - **单例模式**：`ServiceManager`、`ConnectionManager` 等核心管理器
  - **工厂模式**：`DialectFactory` 创建数据库方言实例
  - **策略模式**：各数据库方言实现统一接口
  - **观察者模式**：TreeView 数据变更通知
- **历史包袱说明**: 
  - 🔴 **连接池切换问题**（`connectionNode.ts#L20`）：导致消费队列不正确，影响视图响应
  - 🔴 **SQL 注入风险**：15+ 处字符串拼接，需逐步迁移到参数化查询
  - 🟡 **TypeScript strict: false**：存量代码类型不完善，需逐步收紧
  - 🟡 **缺少单元测试**：仅有集成测试，需补充 Jest/Mocha 测试框架

## 6. 工作流程
- **开发流程步骤**: 
  1. 创建功能分支：`git checkout -b feature/xxx`
  2. 开发并测试：`pnpm run dev` + F5 调试
  3. 运行集成测试：`node tests/integration/phase1.test.js`
  4. 提交代码：遵循 Conventional Commits
  5. 创建 PR 并等待审查
- **PR 审核标准**: 
  - [ ] 代码无 TypeScript 编译错误
  - [ ] 新功能有对应的集成测试
  - [ ] 无安全漏洞（SQL 注入、RCE 等）
  - [ ] 国际化文本已添加到 `package.nls.json` 和 `package.nls.zh-cn.json`
  - [ ] 遵循现有代码风格和命名规范
- **发布流程说明**: 
  1. 更新 `package.json` 版本号
  2. 运行 `pnpm run build` 确认构建成功
  3. 运行 `pnpm run vscode:prepublish` 预处理
  4. 运行 `pnpm run publich` 发布到 VS Code 市场
- **问题排查指南**: 
  - **扩展无法激活**：检查 `package.json` 中的 `activationEvents` 配置
  - **连接失败**：检查 SSH 隧道配置、网络连通性、认证信息
  - **WebView 白屏**：检查浏览器控制台错误，确认 Vue 组件正确加载
  - **查询超时**：检查数据库连接池配置、网络延迟
  - **详细日志**：查看 VS Code Output 面板的 "Database Client" 频道

---

## 附录：关键文件索引

| 文件 | 职责 |
|------|------|
| `src/extension.ts` | 扩展入口，注册命令和 Provider |
| `src/service/serviceManager.ts` | 服务管理器（单例） |
| `src/service/dialectFactory.ts` | 数据库方言工厂 |
| `src/provider/treeDataProvider.ts` | TreeView 数据提供者 |
| `src/model/interface/node.ts` | 抽象节点基类 |
| `src/common/secretService.ts` | 密钥存储服务 |
| `src/vue/App.vue` | WebView 主入口组件 |
| `webpack.config.js` | 三合一构建配置 |
| `package.nls.json` | 英文国际化 |
| `package.nls.zh-cn.json` | 中文国际化 |

---

**文档版本**: 2026-06-01  
**适用版本**: v3.9.8
