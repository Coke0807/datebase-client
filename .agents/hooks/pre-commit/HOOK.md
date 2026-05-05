# Database Client - Pre-commit Hook

> Git 提交前自动检查，确保代码质量和一致性。

## 触发条件

- Git commit 操作前自动执行

## 检查项

### 1. TypeScript 编译检查

```bash
npx tsc --noEmit
```

### 2. 代码风格检查

```bash
npx eslint src/**/*.ts
```

### 3. 敏感信息检查

检查是否包含：
- 硬编码的密码或密钥
- 内部 IP 地址
- 调试用的 console.log（非 Console.log）

### 4. 依赖安全检查

```bash
npm audit --audit-level=high
```

### 5. 构建验证

```bash
npm run build
```

## 跳过检查

如果需要紧急提交，可以使用：

```bash
git commit --no-verify
```

**⚠️ 不建议常规使用，仅用于紧急情况。**

## 配置

### package.json

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run build"
    }
  }
}
```

### 或使用 lint-staged

```json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "git add"],
    "*.vue": ["eslint --fix", "git add"]
  }
}
```

## 注意事项

1. **不要阻止所有提交**：检查应该是建议性的，而非强制性的
2. **快速反馈**：检查应该快速完成，避免长时间等待
3. **清晰的错误信息**：提供明确的修复建议

## 当前状态

⚠️ **项目尚未配置 Git hooks**。建议添加：

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npm run lint"
```
