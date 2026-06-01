# H2 数据库连接方案对比

## 方案对比表

| 方案 | AUTO_SERVER=TRUE | 手动启动服务器 | Spring Boot 自动启动 |
|------|------------------|---------------|---------------------|
| **配置复杂度** | ⭐ 最简单 | ⭐⭐ 需手动启动 | ⭐⭐ 需配置类 |
| **随应用启动** | ✅ 是 | ❌ 否 | ✅ 是 |
| **多进程连接** | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| **端口固定** | ❌ 动态端口 | ✅ 固定端口 | ✅ 固定端口 |
| **VS Code 扩展** | ⚠️ 需特殊配置 | ✅ 直接连接 | ✅ 直接连接 |

---

## 方案一：AUTO_SERVER=TRUE（最简单）

### 原理
第一个连接的进程自动启动内部 TCP 服务器，其他进程通过自动发现的端口连接。

### 配置

```yaml
spring:
  datasource:
    url: jdbc:h2:./data/testdb;AUTO_SERVER=TRUE
```

### VS Code 扩展连接

⚠️ **注意**：`AUTO_SERVER` 使用动态端口，VS Code 扩展无法直接连接。

**解决方案**：使用 H2 文件路径直接连接（嵌入式模式）

```
Database Path: ./data/testdb.mv.db
```

但这种方式需要扩展支持嵌入式连接（当前未实现）。

---

## 方案二：手动启动 H2 服务器

### 启动命令

```bash
# 仅 TCP 模式
java -cp h2.jar org.h2.tools.Server -tcp -tcpPort 9092

# 仅 PostgreSQL 协议模式
java -cp h2.jar org.h2.tools.Server -pg -pgPort 5435

# 同时启动 TCP + PG + Web Console
java -cp h2.jar org.h2.tools.Server \
  -tcp -tcpPort 9092 \
  -pg -pgPort 5435 \
  -web -webPort 8082
```

### VS Code 扩展连接

```
TCP 模式：
  Host: 127.0.0.1
  Port: 9092
  Database: ./data/testdb

PG 模式：
  Host: 127.0.0.1
  Port: 5435
  Database: ./data/testdb
```

---

## 方案三：Spring Boot 自动启动（推荐）

### 步骤

1. 添加 `H2ServerConfig.java` 配置类
2. 在 `application.yml` 中启用：

```yaml
h2:
  server:
    enabled: true
    tcp-port: 9092
    pg-port: 5435
```

3. 启动 Spring Boot 应用，H2 服务器自动启动

### 优点

- ✅ 随应用启动/关闭
- ✅ 固定端口，扩展可直接连接
- ✅ 无需手动操作

---

## 推荐方案

| 场景 | 推荐方案 |
|------|---------|
| 开发环境 | **方案三**：Spring Boot 自动启动 |
| 测试环境 | 方案二：手动启动服务器 |
| 生产环境 | 不建议使用 H2，改用 MySQL/PostgreSQL |

---

## 完整示例项目结构

```
src/main/java/com/example/
├── config/
│   └── H2ServerConfig.java    # H2 服务器配置类
├── Application.java
└── ...

src/main/resources/
├── application.yml            # 主配置
└── application-h2.yml         # H2 专项配置（可选）
```
