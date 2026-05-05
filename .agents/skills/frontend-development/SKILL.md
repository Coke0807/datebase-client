# Database Client - Frontend Development Skill

> WebView 前端开发专用指南，用于 Vue 3 组件开发、样式修改和 WebView 通信。

## 触发条件

- 修改 `src/vue/` 目录下的文件
- 涉及 WebView 通信（`viewManager.ts`、`vscode.js`）
- 前端样式、组件、路由相关任务

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.x | 前端框架 |
| Element Plus | 最新 | UI 组件库 |
| VxeTable | 最新 | 数据表格渲染 |
| Tailwind CSS | 3.x | 样式框架 |
| Vue Router | 4.x | 路由管理 |

## 目录结构

```
src/vue/
├── main.js              # 入口，注册全局组件和插件
├── App.vue              # 根组件
├── connect/             # 连接管理页面
├── design/              # 表设计器
├── forward/             # SSH 端口转发
├── i18n/                # 国际化
├── mixin/               # Vue mixins（工具函数）
├── redis/               # Redis 专用组件
├── result/              # 🔑 SQL 查询结果页（核心）
│   ├── App.vue          # 主容器
│   └── component/       # 子组件
├── status/              # 数据库状态监控
├── structDiff/          # 表结构对比
├── util/                # 工具函数
│   └── vscode.js        # WebView 通信 API
└── xterm/               # 终端组件
```

## WebView 通信协议

### 后端发送消息

```typescript
// src/common/viewManager.ts
handler.emit("DATA", { 
  data: result,      // 查询结果
  fields: columns,   // 列定义
  costTime: 100      // 执行耗时
});
```

### 前端监听消息

```javascript
// src/vue/util/vscode.js
const vscode = getVscodeEvent();

vscode.on("DATA", (response) => {
  this.result.data = response.data;
  this.result.fields = response.fields;
});

vscode.emit("executeSQL", sql);  // 发送到后端
```

### 消息类型

| 类型 | 方向 | 用途 |
|------|------|------|
| `RUN` | 后端→前端 | 更新 SQL 编辑器内容 |
| `DATA` | 后端→前端 | 查询结果数据 |
| `NEXT_PAGE` | 后端→前端 | 分页数据 |
| `executeSQL` | 前端→后端 | 执行 SQL |
| `exportData` | 前端→后端 | 导出数据 |

## 开发规范

### 1. 组件命名

- 页面组件：PascalCase（如 `QueryResult.vue`）
- 子组件：kebab-case 目录（如 `component/edit-dialog/`）

### 2. 样式约定

- 优先使用 Tailwind CSS 工具类
- 组件内样式使用 `<style scoped>`
- 全局样式在 `public/theme/` 目录

### 3. 国际化

```javascript
// 使用 mixin
import { i18n } from "@/vue/mixin/i18n";

export default {
  mixins: [i18n],
  // this.$t('key') 可用
}
```

### 4. 表格渲染

使用 VxeTable 渲染大数据量表格：

```vue
<vxe-table :data="result.data" ref="dataTable">
  <vxe-column type="checkbox" />
  <vxe-column type="seq" />
  <vxe-column 
    v-for="field in result.fields" 
    :key="field.name"
    :field="field.name" 
    :sortable="true"
  />
</vxe-table>
```

## 构建和调试

### 开发模式

```bash
npm run dev  # Webpack watch 模式
```

修改前端代码后，重新打开 WebView 即可看到变化。

### 调试技巧

1. **WebView 开发者工具**：
   - 在 WebView 中右键 → "打开 Webview 开发工具"
   - 可查看控制台日志和网络请求

2. **消息调试**：
   ```javascript
   // 在 vscode.js 中添加日志
   console.log('[WebView] Received:', data.type, data.content);
   ```

## 常见问题

### 1. Node 模块不可用

WebView 运行在浏览器环境，不能使用 `fs`、`net` 等 Node 模块。如需使用，需在 `webpack.config.js` 中配置 polyfill。

### 2. 样式不生效

检查 Tailwind CSS 配置和 `scoped` 样式优先级。Element Plus 组件样式修改需使用 `:deep()` 选择器。

### 3. 通信失败

确保 `acquireVsCodeApi()` 在 VS Code 环境中调用。在浏览器中测试时，需要 mock `vscode` 对象。
