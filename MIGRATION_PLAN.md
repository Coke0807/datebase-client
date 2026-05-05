# Database Client 项目迁移方案分析

> **文档版本**: v2.0  
> **生成日期**: 2026-05-05  
> **项目**: vscode-database-client v3.9.8

---

## 📋 执行摘要

| 项目 | 当前状态 | 建议 | 优先级 |
|------|---------|------|--------|
| **安全漏洞** | axios@0.21.1 SSRF, ssh2@0.5.4, 密码明文存储 | ✅ 立即修复 | 🔴 紧急 |
| **TypeScript** | 3.8 | ✅ 升级到 5.x | 高 |
| **VS Code API** | 1.51.0 | ✅ 升级到 ^1.80.0 | 高 |
| **Webpack** | 4.x | ✅ 升级到 5.x | 高 |
| **架构债务** | Node 基类 God Object, ServiceManager 职责过重 | ✅ 渐进重构 | 中 |
| **Vue** | 2.6 (已停止维护) | ⚠️ 保持或迁移到 Vue 3 | 中 |
| **Element UI** | 2.x | ⚠️ 考虑 Element Plus | 中 |
| **Node.js 特性** | ES6 | ✅ 升级到 ES2020+ | 中 |

---

## 1. 当前技术栈分析

### 1.1 核心技术栈

| 技术 | 版本 | 发布时间 | 支持状态 | 风险等级 |
|------|------|---------|---------|----------|
| **TypeScript** | 3.8 | 2020-02 | ❌ 已过时 | 🔴 高 |
| **VS Code API** | ^1.51.0 | 2020-11 | ❌ 过旧 | 🔴 高 |
| **Vue** | 2.6 | 2019-02 | ❌ 已停止维护 (2023-12) | 🟡 中 |
| **Webpack** | 4.x | 2018-02 | ❌ 已过时 | 🔴 高 |
| **Element UI** | 2.x | 2019 | ❌ 已停止维护 | 🟡 中 |
| **Tailwind CSS** | 未知 | - | ✅ 可用 | 🟢 低 |
| **mysql2** | 2.2.5(2018) | - | ✅ 最新版为3.9.x(2024) | 🟢 低 |
| **ioredis** | 最新 | - | ✅ 活跃 | 🟢 低 |

### 1.2 项目结构特点

```
✅ 优势：
- 清晰的 MVC 分层架构（model/service/provider）
- 双入口 Webpack 配置（extension + webview）
- 支持多种数据库（MySQL/PostgreSQL/Redis/MongoDB/ES）
- 已有 TypeScript 类型系统

⚠️ 挑战：
- Vue 2 + Element UI 生态已停止维护
- Webpack 4 配置复杂，升级需重写
- VS Code API 1.51 缺少现代 API（如 TreeView checkbox、data transfer）
- Node.js polyfill 策略过时（webpack 4 的 node: { fs: 'empty' }）
```

### 1.3 架构债务分析

#### 🔴 Node 基类 — God Object 模式

`src/model/interface/node.ts` 将所有数据库类型的连接配置都塞进了一个类：

```typescript
// 当前：所有属性堆在一个基类中
export abstract class Node extends vscode.TreeItem {
    host: string; port: number; user: string; password?: string;  // 通用
    ssh?: SSHConfig; usingSSH?: boolean;                           // SSH 专用
    esUrl: string; esAuth: string; esToken: string; scheme: string; // ES 专用
    dbPath?: string;                                                // SQLite 专用
    encrypt?: boolean; instanceName?: string; domain?: string;     // MSSQL 专用
    encoding: string; showHidden: boolean;                          // FTP 专用
    // ... 还有更多
}
```

**问题**：每个 Redis 节点都带着 MSSQL 的 `encrypt` 字段，每个 MySQL 节点都带着 ES 的 `esToken` 字段。这是典型的**继承滥用 + 属性膨胀**。

**建议**：迁移时引入组合模式，用 `ConnectionConfig` 接口按数据库类型拆分：

```typescript
interface BaseConnectionConfig {
    host: string; port: number; user: string; password?: string;
    dbType: DatabaseType;
}
interface SSHConfig { usingSSH: boolean; ssh?: SSHDetail; }
interface ESConfig { scheme: string; esAuth: string; esToken: string; }
// 各数据库节点只组合自己需要的 Config
```

#### 🟡 ServiceManager — 职责过重

当前 `ServiceManager` 承担了太多职责：初始化 Provider、注册命令、管理方言映射、管理缓存。建议拆分为 `ProviderRegistry`、`DialectFactory`、`CacheManager` 等独立模块。

#### 🟡 密码存储 — 安全隐患

当前使用 VS Code 的 `Memento`（明文存储）保存数据库密码，应迁移到 `SecretStorage` API（VS Code 1.53+ 提供加密存储）。

---

## 2. 是否需要迁移？

### 2.1 建议迁移的理由

| 理由 | 说明 | 影响 |
|------|------|------|
| **安全性** | 旧版本存在已知漏洞（axios@0.21.1 SSRF、ssh2@0.5.4、密码明文存储） | 🔴 紧急 |
| **兼容性** | VS Code API 1.51 无法使用新特性（如 Notebook API、Test API、SecretStorage） | 🟡 中 |
| **开发效率** | TypeScript 5.x 提供更好类型推断和 const 类型参数 | 🟡 中 |
| **架构债务** | Node 基类 God Object、ServiceManager 职责过重，阻碍新功能开发 | 🟡 中 |
| **生态支持** | Vue 2 生态已停止维护，新组件不可用 | 🟡 中 |
| **构建性能** | Webpack 5 支持持久缓存，构建速度提升 10x | 🟢 低 |

### 2.2 不建议迁移的理由

| 理由 | 说明 | 影响 |
|------|------|------|
| **稳定性** | 当前版本已稳定运行，迁移可能引入新 bug | 🟡 中 |
| **工作量** | Vue 2 → 3 + Element UI → Plus 需重写大量组件 | 🔴 高 |
| **依赖兼容性** | 部分数据库驱动可能不兼容新构建工具 | 🟡 中 |

### ✅ **结论：建议迁移，但采用渐进式策略**

---

## 3. 迁移策略：部分迁移 vs 全量迁移

### 3.1 策略对比

| 维度 | 部分迁移（推荐） | 全量迁移 |
|------|----------------|----------|
| **风险** | 🟢 低（分批验证） | 🔴 高（一次性大改） |
| **工作量** | 🟡 中（分阶段） | 🔴 高（6-12 个月） |
| **用户影响** | 🟢 无感知 | 🔴 可能中断 |
| **技术债务** | 🟡 逐步清理 | 🟢 一次性解决 |
| **回滚难度** | 🟢 容易 | 🔴 困难 |

### 3.2 推荐方案：四阶段渐进式迁移

```
阶段 0 (1周)：安全修复 + 依赖审计（🔴 紧急）
  ├─ axios 升级到 1.x（修复 SSRF 漏洞）
  ├─ ssh2 升级到 0.8.x（修复漏洞，需适配 API 变化）
  ├─ 密码存储从 Memento 迁移到 SecretStorage
  └─ npm audit 全面扫描 + 修复

阶段 1 (1-2周)：基础设施升级
  ├─ TypeScript 3.8 → 5.x（暂不开 strict）
  ├─ VS Code API ^1.51 → ^1.80（直接提升，不做运行时判断）
  ├─ Webpack 4 → 5（含 asset module、loader 迁移）
  └─ Node.js 目标 ES6 → ES2020

阶段 2 (2-4周)：后端服务优化 + 架构治理
  ├─ Node 基类拆分（组合替代继承）
  ├─ ServiceManager 职责拆分
  ├─ 数据库驱动升级（mysql2, pg, ioredis）
  ├─ SSH/隧道库更新
  └─ 代码现代化（可选链、空值合并）

阶段 3 (可选，3-6个月)：前端框架迁移
  ├─ Vue 2.6 → 3.x（或考虑 React）
  ├─ Element UI → Element Plus
  ├─ 组件逐步重写
  └─ 保持向后兼容
```

---

## 4. 健康迁移方案

### 4.1 迁移原则

1. **向后兼容**：新版本必须兼容旧配置和数据
2. **功能对等**：迁移前后功能保持一致
3. **渐进验证**：每阶段完成后充分测试
4. **可回滚**：每个阶段都有明确的回滚方案

### 4.2 详细迁移步骤

#### 阶段 0：安全修复 + 依赖审计（优先级：🔴 紧急）

> **原则**：安全问题不等人，必须在功能迁移之前解决。

##### Step 0.1: 依赖安全扫描

```bash
# 全面扫描已知漏洞
npm audit

# 检查过时依赖
npm outdated

# 批量检查可用更新
npx npm-check-updates
```

##### Step 0.2: axios 升级（修复 SSRF 漏洞）

```bash
# 当前 axios@0.21.1 存在 SSRF 漏洞（CVE-2021-3749）
npm install axios@^1.7.0
```

**破坏性变更**：
- `axios.default` 导出方式变化
- 错误对象结构变化（`error.response` 不变，但 `error.toJSON()` 格式不同）
- 需检查所有 `axios` 调用点是否兼容

##### Step 0.3: ssh2 升级（修复安全漏洞）

```bash
# 当前 ssh2@0.5.4 是 2017 年版本
# 升级到 0.8.x 需要适配 API 变化
npm install ssh2@^0.8.5
```

**⚠️ 重要**：ssh2 0.5 → 0.8 有大量 API 变更：
- `ssh2.Client` → `ssh2.Client`（构造函数不变，但事件和方法签名变化）
- `sftp` 子系统 API 重写
- 需要逐个检查 `src/service/tunnel/` 和 `src/model/ssh/` 下的所有调用

##### Step 0.4: 密码存储迁移到 SecretStorage

```typescript
// ❌ 当前：明文存储在 Memento 中
const connections = this.context.get<{ [key: string]: Node }>(connectionKey, {});

// ✅ 迁移后：使用 VS Code 加密存储
// 存储
await context.secrets.store(`connection.${key}.password`, password);
// 读取
const password = await context.secrets.get(`connection.${key}.password`);
```

**迁移策略**：
1. 新版本同时支持两种存储方式（读取时先查 SecretStorage，再查 Memento）
2. 首次读取到 Memento 中的密码时，自动迁移到 SecretStorage
3. 下个大版本移除 Memento 中的密码字段

##### Step 0.5: 验证

```bash
npm audit          # 确认无高危漏洞
npm run build      # 构建成功
# 手动测试：SSH 连接、数据库连接、密码保存/读取
```

---

#### 阶段 1：基础设施升级（优先级：高）

##### Step 1.1: TypeScript 升级

```bash
# 1. 备份当前配置
cp tsconfig.json tsconfig.json.backup

# 2. 升级 TypeScript
npm install typescript@^5.3.3 --save-dev

# 3. 更新 tsconfig.json
```

```jsonc
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",          // 从 es6 升级
    "outDir": "out",
    "lib": ["ES2020", "ES2022"], // 更新 lib
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "strict": false,             // ⚠️ 暂不开 strict，分步开启
    "noImplicitAny": false,      // 第一步：保持关闭
    "strictNullChecks": false,   // 第二步：后续逐步开启
    "skipLibCheck": true         // 跳过库检查加速编译
  }
}
```

**⚠️ 关于 strict 模式的分步策略**：

直接开启 `strict: true` 会一次性暴露数百个类型错误，工作量巨大且容易引入 bug。建议分步：

| 步骤 | 配置 | 时机 |
|------|------|------|
| 第一步 | `strict: false` | TypeScript 5 升级时 |
| 第二步 | 开启 `noImplicitAny` | 阶段 2 代码稳定后 |
| 第三步 | 开启 `strictNullChecks` | 逐步修复 null 相关错误 |
| 第四步 | 开启 `strict` | 所有子项修复完成后 |

**预期问题**：
- 类型错误可能增加（需逐个修复）
- 部分库类型定义可能不兼容

**验证方法**：
```bash
npx tsc --noEmit  # 检查类型错误
npm run build      # 验证构建成功
```

##### Step 1.2: VS Code API 升级

```json
// package.json
{
  "engines": {
    "vscode": "^1.80.0"  // 从 ^1.51.0 升级
  }
}
```

**⚠️ 修正：不需要运行时版本判断**

VS Code 扩展不需要 `if (apiVersion >= '1.64.0')` 这样的运行时判断。`engines.vscode` 字段决定了最低版本，VS Code 会自动处理兼容性。直接提升版本号后使用新 API 即可。

**可利用的新 API**：

| API | 最低版本 | 用途 |
|-----|---------|------|
| `TreeDataProvider.getParent()` | 1.64+ | 树节点导航 |
| `StatusBarItem` 新属性 | 1.70+ | 状态栏增强 |
| `SecretStorage` | 1.53+ | 加密存储（阶段 0 已用） |
| `TreeItem.checkboxState` | 1.64+ | 树节点复选框 |
| `DataTransfer` API | 1.67+ | 拖拽支持 |

##### Step 1.3: Webpack 5 升级

```bash
# 1. 卸载 Webpack 4
npm uninstall webpack webpack-cli

# 2. 安装 Webpack 5
npm install webpack@^5.90.0 webpack-cli@^5.1.4 --save-dev

# 3. 安装新插件（替代旧版）
npm install terser-webpack-plugin@^5.3.10 --save-dev
```

**webpack.config.js 完整变更清单**：

```javascript
// ========== Extension 配置（target: "node"）==========

// ❌ 移除：Webpack 4 的 node polyfill 方式
node: {
    fs: 'empty', net: 'empty', tls: 'empty',
    child_process: 'empty', dns: 'empty',
    global: true, __dirname: true
}

// ✅ 替换为：Webpack 5 的 resolve.fallback
resolve: {
    fallback: {
        fs: false, net: false, tls: false,
        child_process: false, dns: false
    }
}
node: {
    global: true,
    __dirname: false  // ⚠️ 注意：Webpack 5 中 __dirname 默认为 false
}

// ✅ 新增：持久缓存（构建速度提升 10x）
cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack-cache')
}

// ✅ 新增：IgnorePlugin 语法更新
// 旧：new webpack.IgnorePlugin(/^(pg-native|cardinal|...)$/)
// 新：
new webpack.IgnorePlugin({ resourceRegExp: /^(pg-native|cardinal|encoding|aws4|pg-cloudflare)$/ })

// ========== WebView 配置 ==========

// ❌ 移除：url-loader（Webpack 5 内置 asset module）
{ test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/, loader: 'url-loader', options: { limit: 80000 } }

// ✅ 替换为：
{ test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/, type: 'asset', parser: { dataUrlCondition: { maxSize: 80000 } } }

// ❌ 移除：vue-loader 的旧 loaders 选项格式
{ test: /\.vue$/, loader: 'vue-loader', options: { loaders: { css: [...] } } }

// ✅ 替换为：
{ test: /\.vue$/, loader: 'vue-loader' }
// css 处理在 module.rules 中统一配置即可
```

**Vue Loader 版本选择**：
```bash
# Vue 2 保持 vue-loader@15.x（兼容 Webpack 5）
npm install vue-loader@^15.11.0 --save-dev
# ⚠️ vue-loader@16.x 仅支持 Vue 3，不要在此阶段升级
```

**postcss-loader 兼容性**：
```bash
# 确认 PostCSS 8 兼容
npm install postcss@^8.4.0 postcss-loader@^7.3.0 --save-dev
```

##### Step 1.4: 验证

```bash
npm run build          # 构建成功
npm run dev            # watch 模式正常
# 手动测试：扩展加载、WebView 渲染、基本功能
```

#### 阶段 2：后端服务优化 + 架构治理（优先级：中）

##### Step 2.1: 数据库驱动升级

```bash
# 检查过时驱动
npm outdated

# 升级到兼容版本
npm install mysql2@^3.9.0 pg@^8.11.0 ioredis@^5.3.0 mongodb@^6.3.0 --save
```

**⚠️ Breaking Changes 检查清单**：

| 驱动 | 版本变化 | 主要破坏性变更 |
|------|---------|---------------|
| mongodb | 4.x → 6.x | 移除 `Db.collection()` 的 callback 模式；`Cursor` API 变更 |
| ioredis | 4.x → 5.x | 移除 `Redis.sentinel` 方法；事件名变化 |
| pg | 8.x 小版本 | 通常向后兼容，但需检查 `Pool` 行为变化 |

##### Step 2.2: Node 基类拆分（组合替代继承）

**目标**：消除 God Object，让各数据库节点只持有自己需要的配置。

```typescript
// ✅ 新的组合式设计
// src/model/interface/connectionConfig.ts

export interface BaseConnectionConfig {
    host: string;
    port: number;
    user: string;
    password?: string;
    dbType: DatabaseType;
    database?: string;
    schema?: string;
}

export interface SSHConnectionConfig extends BaseConnectionConfig {
    usingSSH: boolean;
    ssh?: SSHDetail;
}

export interface ESConnectionConfig extends BaseConnectionConfig {
    scheme: string;
    esAuth: string;
    esToken: string;
    esUrl: string;
}

export interface SQLiteConnectionConfig extends BaseConnectionConfig {
    dbPath: string;
}

export interface MSSQLConnectionConfig extends BaseConnectionConfig {
    encrypt?: boolean;
    instanceName?: string;
    domain?: string;
    authType?: string;
}

export interface FTPConnectionConfig extends BaseConnectionConfig {
    encoding: string;
    showHidden: boolean;
}
```

**迁移策略**：
1. 先创建新的 Config 接口（不破坏现有代码）
2. 在各子类构造函数中，通过 `init()` 方法只赋值自己需要的字段
3. 逐步移除 Node 基类中不属于通用连接的属性
4. 每步完成后运行冒烟测试

##### Step 2.3: ServiceManager 职责拆分

```typescript
// 当前：所有逻辑堆在 ServiceManager 中
export class ServiceManager {
    public connectService = new ConnectService();
    public historyService = new HistoryRecorder();
    public mockRunner: MockRunner;
    public provider: DbTreeDataProvider;
    // ... 20+ 个属性和方法
}

// ✅ 拆分后：
// src/service/providerRegistry.ts — 管理 VS Code Provider 注册
export class ProviderRegistry { ... }

// src/service/dialectFactory.ts — 管理数据库方言映射
export class DialectFactory {
    static getDialect(dbType: DatabaseType): SqlDialect { ... }
}

// src/service/cacheManager.ts — 管理缓存生命周期
export class CacheManager { ... }

// ServiceManager 退化为薄薄的 Facade
export class ServiceManager {
    constructor(context: ExtensionContext) {
        ProviderRegistry.register(context);
        CacheManager.init(context);
    }
}
```

##### Step 2.4: 代码现代化（ES2020+ 语法）

```typescript
// 旧语法
const name = user && user.name;
const port = config.port || 3306;
const db = config.database ? config.database : 'default';

// 新语法（ES2020+）
const name = user?.name;
const port = config.port ?? 3306;
const db = config.database ?? 'default';

// 可选：使用 const 断言
const MODEL_TYPE = {
    TABLE: 'table',
    CONNECTION: 'connection'
} as const;  // TypeScript 3.4+
```

**⚠️ 注意**：`command-exists` 模块当前用 `require()` 引入，应改为 ESM import：
```typescript
// 旧
var commandExistsSync = require('command-exists').sync;
// 新
import { sync as commandExistsSync } from 'command-exists';
```

##### Step 2.5: 遗漏依赖处理

| 依赖 | 问题 | 处理方案 |
|------|------|---------|
| `umy-table` | 小众表格组件，可能没有 Vue 3 版本 | 阶段 3 前需调研替代品（如 `vxe-table`） |
| `vue-router` 3.x | Vue 3 需要升级到 4.x | 仅在阶段 3 执行时处理 |
| `oldCompatible.js` | `public/js/` 下的兼容脚本 | 评估是否仍需要，如不需要则移除 |
| `vsce` 打包工具 | 打包工具链也需要升级 | 确认与 Webpack 5 产物兼容 |

##### Step 2.6: 验证

```bash
npm run build          # 构建成功
npx tsc --noEmit       # 类型检查通过
# 手动测试：所有数据库连接类型、SSH 隧道、数据导入导出
```

#### 阶段 3：前端框架迁移（优先级：低，可选）

##### Step 3.1: Vue 2 → 3 迁移（如决定迁移）

```bash
# 1. 安装 Vue 3 和 Element Plus
npm install vue@^3.4.0 element-plus @element-plus/icons-vue

# 2. 卸载 Vue 2
npm uninstall vue element-ui vue-loader@15

# 3. 安装 Vue 3 的 loader
npm install vue-loader@^16.0.0 --save-dev
```

**主要破坏性变更**：
- `new Vue()` → `createApp()`
- `scopedSlots` → `v-slot`
- `filters` 移除（用 computed 替代）
- `Element UI` → `Element Plus`（组件名变化）

**渐进迁移策略**：
```javascript
// main.js 兼容写法
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);
app.use(ElementPlus);
app.mount('#app');
```

---

## 5. 风险与应对

### 5.1 高风险项

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| **安全漏洞利用** | 🔴 紧急 | 阶段 0 优先修复，不等其他阶段 |
| **ssh2 API 不兼容** | 🔴 高 | 逐个文件适配，保留旧版作为 fallback |
| **Webpack 5 构建失败** | 🔴 高 | 保留 webpack 4 配置作为备份，分阶段迁移 loader |
| **密码迁移数据丢失** | 🔴 高 | 双写策略：同时写入 Memento 和 SecretStorage，读取时优先 SecretStorage |
| **Node 基类拆分引入 bug** | 🟡 中 | 先创建新接口，逐步迁移，每步冒烟测试 |
| **umy-table 无 Vue 3 版本** | 🟡 中 | 阶段 3 前调研替代品，如无则保持 Vue 2 |
| **VS Code API 不兼容** | 🟡 中 | 直接提升最低版本，不做运行时判断 |

### 5.2 回滚方案

每个阶段完成后，创建 Git 标签：

```bash
# 阶段 1 完成
git tag -a v3.9.8-phase1 -m "Phase 1: Infrastructure upgrade"
git push origin v3.9.8-phase1

# 如需回滚
git revert <phase1-commit-hash>
# 或
git checkout v3.9.8  # 回到旧版本
```

---

## 6. 测试计划

### 6.1 自动化测试策略

> **现状**：项目当前无自动化测试。迁移过程中应逐步引入。

| 阶段 | 测试方式 | 工具 |
|------|---------|------|
| 阶段 0 | 安全验证 | `npm audit`、手动验证密码迁移 |
| 阶段 1 | 构建验证 | `npx tsc --noEmit` + `npm run build` |
| 阶段 2 | 冒烟测试 | 每个子步骤完成后手动验证核心功能 |
| 阶段 3 | 回归测试 | 考虑引入 `@vscode/test-electron` 做端到端测试 |

**建议引入的测试框架**（可选，非阻塞）：
```bash
# VS Code 扩展官方测试方案
npm install @vscode/test-electron --save-dev
# 或者用 Vitest 做纯逻辑单元测试
npm install vitest --save-dev
```

### 6.2 每阶段验证检查点

#### 阶段 0 验证
```bash
npm audit              # 确认无高危漏洞
npm run build          # 构建成功
```
- [ ] SSH 连接正常
- [ ] 密码保存/读取正常（SecretStorage）
- [ ] 旧密码自动迁移到 SecretStorage
- [ ] axios 请求正常（ES 连接等）

#### 阶段 1 验证
```bash
npx tsc --noEmit       # TypeScript 类型检查
npm run build          # 生产构建
npm run dev            # 开发构建（watch 模式）
```
- [ ] 扩展正常加载
- [ ] WebView 正常渲染
- [ ] 热更新正常工作

#### 阶段 2 验证
```bash
npx tsc --noEmit       # 类型检查
npm run build          # 构建成功
```
- [ ] 所有数据库连接类型正常
- [ ] SSH 隧道连接正常
- [ ] 数据导入/导出正常
- [ ] SQL 执行和结果展示正常

### 6.3 手动测试清单（全量）

- [ ] 数据库连接（MySQL/PostgreSQL/Redis/MongoDB/ES/MSSQL/SQLite/H2/Exasol）
- [ ] SQL 执行和结果展示
- [ ] 表结构设计器
- [ ] 数据导出/导入
- [ ] SSH 隧道连接
- [ ] Redis Key 浏览
- [ ] 状态监控面板
- [ ] FTP 文件浏览
- [ ] 历史记录功能
- [ ] SQL 自动补全
- [ ] Mock 数据生成

### 6.4 兼容性测试

- [ ] VS Code 1.80+ 新版本测试
- [ ] Node.js 18+ 环境测试
- [ ] Windows/macOS/Linux 跨平台测试

---

## 7. 时间规划

| 阶段 | 任务 | 预计时间 | 优先级 | 里程碑 |
|------|------|---------|--------|--------|
| **阶段 0** | 安全修复 + 依赖审计 | 1 周 | 🔴 紧急 | 无高危漏洞 + 密码加密存储 |
| **阶段 1** | 基础设施升级 | 1-2 周 | 高 | TypeScript 5 + Webpack 5 + VS Code API 1.80 |
| **阶段 2** | 后端优化 + 架构治理 | 2-4 周 | 中 | 驱动升级 + Node 基类拆分 + 代码现代化 |
| **阶段 3** | 前端迁移（可选） | 3-6 个月 | 低 | Vue 3 + Element Plus |

**总计**：最小可行迁移（阶段 0+1+2）约 **4-7 周**；完整迁移约 **5-9 个月**。

---

## 8. 决策建议

### ✅ 推荐路径

```
立即执行：阶段 0（安全修复）
  └─ 收益：消除已知安全漏洞、密码加密存储
  └─ 风险：低（改动范围可控）
  └─ ⚠️ 不可跳过，安全问题是最高优先级

紧随其后：阶段 1（基础设施升级）
  └─ 收益：构建速度↑、类型安全↑、可使用新 VS Code API
  └─ 风险：低（有回滚方案）

阶段 1 稳定后：阶段 2（后端优化 + 架构治理）
  └─ 触发条件：阶段 1 稳定运行 1-2 周
  └─ 收益：代码可维护性↑、依赖漏洞↓、架构清晰
  └─ 风险：中（Node 基类拆分需谨慎）

6个月后：决策阶段 3（前端迁移）
  └─ 触发条件：Vue 2 生态彻底停止 + umy-table 有替代品
  └─ 替代方案：保持 Vue 2 + @vue/compat 兼容层
```

### ❌ 不推荐路径

- **一次性全量迁移**：风险过高，可能引入大量 bug
- **不迁移**：技术债务累积，安全隐患增加
- **跳过阶段 0**：安全漏洞不应拖延修复
- **只迁移前端**：后端基础设施过时，整体收益低
- **直接开启 strict 模式**：一次性暴露数百个类型错误，工作量不可控

---

## 9. 附录

### 9.1 相关文档

- [TypeScript 5.0 迁移指南](https://www.typescriptlang.org/docs/handbook/upgrading-to-typescript-5.html)
- [VS Code Extension API 更新日志](https://code.visualstudio.com/updates/)
- [Webpack 5 迁移指南](https://webpack.js.org/migrate/5/)
- [Vue 2 → 3 迁移指南](https://v3-migration.vuejs.org/)
- [VS Code SecretStorage API](https://code.visualstudio.com/api/references/vscode-api#SecretStorage)
- [ssh2 0.8.x 文档](https://github.com/mscdex/ssh2)
- [axios 1.x 迁移指南](https://github.com/axios/axios/blob/v1.x/MIGRATION_GUIDE.md)

### 9.2 工具推荐

| 工具 | 用途 | 链接 |
|------|------|------|
| **npm-check-updates** | 批量检查依赖更新 | `npx npm-check-updates` |
| **npm audit** | 依赖安全扫描 | `npm audit` |
| **VS Code Extension Test Runner** | 自动化测试 | `@vscode/test-electron` |
| **Vitest** | 轻量级单元测试 | `npm install vitest` |
| **vxe-table** | umy-table 的潜在替代品 | [GitHub](https://github.com/x-extends/vxe-table) |

### 9.3 关键文件速查

| 文件 | 迁移阶段 | 变更类型 |
|------|---------|---------|
| `package.json` | 阶段 0+1 | 依赖升级、engines.vscode 提升 |
| `tsconfig.json` | 阶段 1 | target/lib 更新 |
| `webpack.config.js` | 阶段 1 | node polyfill → resolve.fallback、asset module |
| `src/model/interface/node.ts` | 阶段 2 | 基类拆分、组合式 Config |
| `src/service/serviceManager.ts` | 阶段 2 | 职责拆分 |
| `src/service/connectionManager.ts` | 阶段 0 | 密码存储迁移到 SecretStorage |
| `src/vue/main.js` | 阶段 3 | Vue 2 → 3（可选） |

### 9.4 联系方式

如有疑问，请联系：
- **项目维护者**: cc521yy@gmail.com
- **Issue Tracker**: https://github.com/Coke0807/datebase-client/issues

---

**文档结束** | 最后更新：2026-05-05
