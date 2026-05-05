# Database Client - Node Development Skill

> 树节点开发专用指南，用于创建新的树节点类型或修改现有节点行为。

## 触发条件

- 修改 `src/model/` 目录下的文件
- 创建新的树节点类型
- 修改树视图行为
- 涉及 `Node` 基类或 `TreeDataProvider`

## Node 基类核心

### 生命周期

```typescript
// src/model/interface/node.ts
export abstract class Node extends vscode.TreeItem {
  
  // 1️⃣ 构造阶段
  constructor() {
    super(label, collapsibleState);
  }
  
  // 2️⃣ 初始化（必须调用）
  protected init(source: Node): void {
    // 从父节点复制连接信息
    this.host = source.host;
    this.port = source.port;
    this.user = source.user;
    this.password = source.password;
    this.dbType = source.dbType;
    this.dialect = ServiceManager.getDialect(this.dbType);
    // ...
  }
  
  // 3️⃣ 缓存自身（可选）
  public cacheSelf(): void {
    Node.nodeCache[this.getConnectId()] = this;
  }
  
  // 4️⃣ 获取子节点（核心）
  public abstract getChildren(isRefresh?: boolean): Node[] | Promise<Node[]>;
  
  // 5️⃣ 持久化操作
  public async indent(command: IndentCommand): Promise<void> {
    // add/update: 保存到 Memento + SecretStorage
    // delete: 移除连接和密码
  }
}
```

### 关键属性

| 属性 | 类型 | 用途 |
|------|------|------|
| `host` | string | 数据库主机 |
| `port` | number | 端口号 |
| `user` | string | 用户名 |
| `password` | string | 密码（存储在 SecretStorage） |
| `database` | string | 数据库名 |
| `schema` | string | Schema 名（PostgreSQL） |
| `dbType` | DatabaseType | 数据库类型 |
| `dialect` | SqlDialect | SQL 方言实例 |
| `parent` | Node | 父节点引用（⚠️ 循环引用） |
| `contextValue` | string | 用于菜单匹配（ModelType） |

## 创建新节点类型

### 步骤 1：定义节点类

```typescript
// src/model/main/myNode.ts
import { Node } from "@/model/interface/node";
import { ModelType } from "@/common/constants";

export class MyNode extends Node {
  constructor(readonly name: string, readonly parent: Node) {
    super(name, vscode.TreeItemCollapsibleState.None);
    
    // 1. 初始化连接信息
    this.init(parent);
    
    // 2. 设置节点属性
    this.contextValue = ModelType.MY_NODE;  // 用于菜单匹配
    this.iconPath = path.join(Global.extensionPath, 'resources/icon/myicon.svg');
    
    // 3. 缓存自身（可选）
    this.cacheSelf();
  }
  
  async getChildren(): Promise<Node[]> {
    // 叶子节点返回空数组
    return [];
  }
}
```

### 步骤 2：添加到父节点的 getChildren

```typescript
// src/model/main/tableNode.ts
async getChildren(): Promise<Node[]> {
  const children: Node[] = [];
  
  // 添加新节点类型
  const myNodes = await this.getMyNodes();
  children.push(...myNodes.map(n => new MyNode(n.name, this)));
  
  return children;
}
```

### 步骤 3：定义 ModelType

```typescript
// src/common/constants.ts
export enum ModelType {
  // 现有类型...
  MY_NODE = "myNode",
}
```

### 步骤 4：添加命令和菜单

```json
// package.json
{
  "contributes": {
    "commands": [
      {
        "command": "mysql.myNode.action",
        "title": "My Node Action"
      }
    ],
    "menus": {
      "view/item/context": [
        {
          "command": "mysql.myNode.action",
          "when": "viewItem == myNode",
          "group": "navigation"
        }
      ]
    }
  }
}
```

### 步骤 5：注册命令处理

```typescript
// src/extension.ts
initCommand({
  // ...
  "mysql.myNode.action": (node: MyNode) => {
    node.doAction();
  },
})
```

## 缓存机制

### 三层缓存

| 缓存层 | 存储位置 | 生命周期 | 用途 |
|------|--------|---------|------|
| 自身缓存 | `Node.nodeCache` | 扩展生命周期 | 快速查找节点 |
| 子节点缓存 | `DatabaseCache.childCache` | 手动刷新 | LazyLoad |
| 状态缓存 | `DatabaseCache.elementState` | VS Code 生命周期 | 展开/折叠状态 |

### 使用缓存

```typescript
// 获取缓存的节点
const cachedNode = Node.nodeCache[connectId];

// 清除子节点缓存（刷新时）
DatabaseCache.clearChildrenCache(node.getConnectId());

// 获取/设置展开状态
const state = DatabaseCache.getElementState(node.getConnectId());
DatabaseCache.setElementState(node.getConnectId(), { expanded: true });
```

## 循环引用处理

**⚠️ Node 对象存在循环引用（parent 属性），不能直接 JSON.stringify**

```typescript
// ✅ 正确：使用 NodeUtil.removeParent()
import { NodeUtil } from "@/model/nodeUtil";

const json = JSON.stringify(NodeUtil.removeParent(node));

// ❌ 错误：直接序列化
const json = JSON.stringify(node);  // 会抛出循环引用错误
```

## 连接 ID 管理

```typescript
// 生成唯一连接标识
public getConnectId(opt?: SwitchOpt): string {
  // 格式：key@@host@port[@database][@schema]
  let id = `${this.key}@@${this.host}@${this.port}`;
  
  if (this.database) {
    id += `@${this.database}`;
  }
  
  if (this.schema) {
    id += `@${this.schema}`;
  }
  
  return id;
}
```

## SQL 执行快捷方法

```typescript
// 在 Node 中执行 SQL
const results = await this.execute<any>(sql);

// 等价于
const connection = await ConnectionManager.getConnection(this);
const results = (await QueryUnit.queryPromise(connection, sql)).rows;
```

## 常见问题

### 1. 子节点不显示

检查：
- `getChildren()` 是否返回非空数组
- `collapsibleState` 是否正确设置
- 是否调用了 `DbTreeDataProvider.refresh(node)`

### 2. 菜单不显示

检查：
- `contextValue` 是否与 `package.json` 中的 `when` 条件匹配
- 命令是否正确注册

### 3. 连接信息丢失

确保在构造函数中调用了 `init(parent)`，这会从父节点复制连接信息。

### 4. 刷新后数据不更新

需要清除子节点缓存：

```typescript
DatabaseCache.clearChildrenCache(this.getConnectId());
const children = await this.getChildren(true);
```

## 调试技巧

### 1. 日志输出

```typescript
import { Console } from "@/common/Console";

Console.log(`[MyNode] Loading children for ${this.name}`);
```

### 2. 检查节点状态

```typescript
// 在 getChildren 中添加断点或日志
console.log({
  connectId: this.getConnectId(),
  database: this.database,
  dbType: this.dbType,
});
```

### 3. 测试连接

```typescript
// 测试数据库连接
const connection = await ConnectionManager.getConnection(this);
const result = await this.execute("SELECT 1");
Console.log("Connection test:", result);
```
