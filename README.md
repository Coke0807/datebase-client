# Database Client

<div align="center">

![Database Client](resources/logo.png)

[![Version](https://img.shields.io/badge/version-3.9.8-blue.svg)](https://github.com/Coke0807/datebase-client)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.80%2B-blue.svg)](https://code.visualstudio.com/)

**强大的 VS Code 数据库管理扩展**

[English](#english) | [中文](#中文)

</div>

---

## 中文

### 📖 简介

Database Client 是一个功能强大的 VS Code 扩展，为开发者提供便捷的数据库管理解决方案。支持多种主流数据库，提供直观的图形界面和丰富的功能特性。

### ✨ 核心特性

#### 🔌 多数据库支持

- **关系型数据库**
  - MySQL / MariaDB
  - PostgreSQL
  - Microsoft SQL Server (MSSQL)
  - SQLite
  - Exasol
  - H2 Database

- **NoSQL 数据库**
  - MongoDB
  - Redis
  - ElasticSearch

- **其他**
  - FTP/SFTP 连接

#### 🛠️ 主要功能

**数据库管理**
- ✅ 连接管理（添加、编辑、删除、导入、导出连接配置）
- ✅ 数据库创建与删除
- ✅ 表结构设计与修改
- ✅ 视图、存储过程、触发器管理
- ✅ 用户权限管理

**查询功能**
- ✅ SQL 编辑器（语法高亮、智能提示）
- ✅ 查询执行（选中执行、全部执行）
- ✅ 查询历史记录
- ✅ 结果集导出（CSV、JSON、Excel）
- ✅ SQL 格式化

**数据操作**
- ✅ 数据导入（SQL 文件）
- ✅ 数据导出（多种格式）
- ✅ 表数据编辑
- ✅ Mock 数据生成

**高级功能**
- ✅ 数据库结构同步（Diff）
- ✅ 数据库文档生成
- ✅ SSH 隧道连接
- ✅ 服务器状态监控
- ✅ ER 图生成

#### 🎨 用户体验

- 🌐 中英文双语支持
- 🎯 直观的树形视图
- ⌨️ 丰富的快捷键
- 📊 可视化数据展示
- 🎨 多主题支持

### 📦 安装

#### 从 VS Code 扩展市场安装

1. 打开 VS Code
2. 按 `Ctrl+Shift+X` 打开扩展视图
3. 搜索 "Database Client"
4. 点击安装

#### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/Coke0807/datebase-client.git

# 进入项目目录
cd datebase-client

# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 按 F5 启动调试
```

### 🚀 快速开始

#### 1. 添加数据库连接

- 点击侧边栏的 **Database** 图标
- 点击 **+** 按钮或按 `Ctrl+Shift+P` 输入 `MySQL: Add Connection`
- 填写连接信息：
  - 主机地址
  - 端口号
  - 用户名
  - 密码
  - 数据库名称（可选）

#### 2. 执行 SQL 查询

- 连接数据库后，右键点击数据库或表
- 选择 **New Query** 创建新查询
- 编写 SQL 语句
- 按 `Ctrl+Enter` 执行选中 SQL 或 `Ctrl+Shift+Enter` 执行全部

#### 3. 数据导入导出

- 右键点击表或数据库
- 选择 **Export Data** 或 **Import SQL**
- 选择导出格式（CSV、JSON、Excel 等）

### ⌨️ 常用快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Enter` | 执行选中 SQL |
| `Ctrl+Shift+Enter` | 执行全部 SQL |
| `Ctrl+Shift+P` → `MySQL: Add Connection` | 添加连接 |
| `Ctrl+Shift+P` → `MySQL: Open History` | 打开查询历史 |
| `F5` | 刷新数据库列表 |

### 🔧 配置

#### 连接配置文件位置

连接配置保存在 VS Code 的全局状态中，支持导入导出。

#### SSH 隧道配置

支持通过 SSH 隧道连接数据库，适用于远程服务器场景。

```json
{
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "password",
  "ssh": {
    "host": "remote.server.com",
    "port": 22,
    "username": "user",
    "privateKey": "/path/to/private/key"
  }
}
```

### 🏗️ 项目结构

```
database-client/
├── src/
│   ├── extension.ts          # 扩展入口
│   ├── common/               # 公共工具
│   ├── model/                # 数据模型
│   │   ├── database/         # 数据库节点模型
│   │   ├── mongo/            # MongoDB 模型
│   │   ├── redis/            # Redis 模型
│   │   └── ...
│   ├── service/              # 核心服务
│   │   ├── connect/          # 连接服务
│   │   ├── dialect/          # 数据库方言
│   │   ├── export/           # 导出服务
│   │   ├── import/           # 导入服务
│   │   └── ...
│   ├── provider/             # VS Code Provider
│   └── vue/                  # Vue 前端组件
├── syntaxes/                 # 语法高亮配置
├── resources/                # 资源文件
└── docs/                     # 文档
```

### 🛠️ 技术栈

- **语言**: TypeScript 5.3.3
- **编辑器 API**: VS Code Extension API 1.118
- **前端框架**: Vue.js
- **构建工具**: Webpack 5
- **样式**: Tailwind CSS
- **数据库驱动**:
  - MySQL: `mysql2`
  - PostgreSQL: `pg`
  - MSSQL: `tedious`
  - MongoDB: `mongodb`
  - Redis: `ioredis`
  - SQLite: `better-sqlite3`

### 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

#### 开发环境设置

```bash
# 安装依赖
pnpm install

# 启动开发模式
pnpm run dev

# 运行测试
pnpm test

# 构建生产版本
pnpm run build
```

#### 提交规范

请遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新历史。

### 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

### 🙏 致谢

感谢所有贡献者和开源社区的支持！

---

## English

### 📖 Introduction

Database Client is a powerful VS Code extension that provides developers with a convenient database management solution. It supports multiple mainstream databases and offers an intuitive graphical interface with rich features.

### ✨ Key Features

#### 🔌 Multi-Database Support

- **Relational Databases**
  - MySQL / MariaDB
  - PostgreSQL
  - Microsoft SQL Server (MSSQL)
  - SQLite
  - Exasol
  - H2 Database

- **NoSQL Databases**
  - MongoDB
  - Redis
  - ElasticSearch

- **Others**
  - FTP/SFTP Connections

#### 🛠️ Main Functions

**Database Management**
- ✅ Connection management (add, edit, delete, import, export configurations)
- ✅ Database creation and deletion
- ✅ Table structure design and modification
- ✅ View, stored procedure, trigger management
- ✅ User permission management

**Query Features**
- ✅ SQL editor (syntax highlighting, intelligent suggestions)
- ✅ Query execution (selected execution, full execution)
- ✅ Query history
- ✅ Result set export (CSV, JSON, Excel)
- ✅ SQL formatting

**Data Operations**
- ✅ Data import (SQL files)
- ✅ Data export (multiple formats)
- ✅ Table data editing
- ✅ Mock data generation

**Advanced Features**
- ✅ Database structure synchronization (Diff)
- ✅ Database documentation generation
- ✅ SSH tunnel connection
- ✅ Server status monitoring
- ✅ ER diagram generation

### 📦 Installation

#### Install from VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions view
3. Search for "Database Client"
4. Click Install

#### Build from Source

```bash
# Clone repository
git clone https://github.com/Coke0807/datebase-client.git

# Navigate to project directory
cd datebase-client

# Install dependencies
pnpm install

# Build project
pnpm run build

# Press F5 to start debugging
```

### 🚀 Quick Start

#### 1. Add Database Connection

- Click the **Database** icon in the sidebar
- Click the **+** button or press `Ctrl+Shift+P` and type `MySQL: Add Connection`
- Fill in connection details:
  - Host
  - Port
  - Username
  - Password
  - Database name (optional)

#### 2. Execute SQL Queries

- After connecting to a database, right-click on the database or table
- Select **New Query** to create a new query
- Write SQL statements
- Press `Ctrl+Enter` to execute selected SQL or `Ctrl+Shift+Enter` to execute all

#### 3. Data Import/Export

- Right-click on a table or database
- Select **Export Data** or **Import SQL**
- Choose export format (CSV, JSON, Excel, etc.)

### 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

### 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star 支持一下！**

**If this project helps you, please give it a ⭐️ Star!**

[![GitHub stars](https://img.shields.io/github/stars/Coke0807/datebase-client.svg?style=social&label=Star)](https://github.com/Coke0807/datebase-client)

</div>
