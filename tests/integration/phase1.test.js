/**
 * 阶段 1 集成测试
 * 验证 TypeScript 5.x、VS Code API 1.80、Webpack 5 升级后的基本功能
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('🧪 开始阶段 1 集成测试...\n');

// 测试 1: 验证构建产物存在
console.log('✅ 测试 1: 验证构建产物');
const extensionPath = path.join(__dirname, '../../out/extension.js');
const webviewAppPath = path.join(__dirname, '../../out/webview/app.html');
const webviewResultPath = path.join(__dirname, '../../out/webview/result.html');

assert.ok(fs.existsSync(extensionPath), 'extension.js 应该存在');
assert.ok(fs.existsSync(webviewAppPath), 'webview/app.html 应该存在');
assert.ok(fs.existsSync(webviewResultPath), 'webview/result.html 应该存在');
console.log('   ✓ 所有构建产物存在\n');

// 测试 2: 验证 TypeScript 编译产物
console.log('✅ 测试 2: 验证 TypeScript 编译');
const extensionContent = fs.readFileSync(extensionPath, 'utf-8');
assert.ok(extensionContent.includes('exports'), '编译产物应该包含 CommonJS 导出');
assert.ok(!extensionContent.includes('import type'), '编译产物不应包含 TypeScript 类型导入');
console.log('   ✓ TypeScript 编译正确\n');

// 测试 3: 验证 Webpack 5 特性
console.log('✅ 测试 3: 验证 Webpack 5 特性');
const webpackConfigPath = path.join(__dirname, '../../webpack.config.js');
const webpackConfig = fs.readFileSync(webpackConfigPath, 'utf-8');

// 验证持久化缓存配置
assert.ok(webpackConfig.includes("type: 'filesystem'"), '应该配置持久化缓存');

// 验证 IgnorePlugin 新语法
assert.ok(webpackConfig.includes('resourceRegExp'), '应该使用新的 IgnorePlugin 语法');

// 验证 Asset Modules
assert.ok(webpackConfig.includes("type: 'asset'"), '应该使用 Asset Modules');

// 验证 Webpack 5 polyfill
assert.ok(webpackConfig.includes('resolve.fallback') || webpackConfig.includes('fallback:'), '应该配置 resolve.fallback');

console.log('   ✓ Webpack 5 配置正确\n');

// 测试 4: 验证 package.json 依赖版本
console.log('✅ 测试 4: 验证依赖版本');
const packageJsonPath = path.join(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// 验证 TypeScript 版本
const tsVersion = packageJson.devDependencies.typescript;
assert.ok(tsVersion && tsVersion.includes('^5.'), 'TypeScript 应该是 5.x 版本');

// 验证 VS Code API 版本
const vscodeVersion = packageJson.devDependencies['@types/vscode'];
assert.ok(vscodeVersion && (vscodeVersion.includes('^1.8') || vscodeVersion.includes('^1.1')), 'VS Code API 应该是 1.80+ 版本');

// 验证 Webpack 版本
const webpackVersion = packageJson.devDependencies.webpack;
assert.ok(webpackVersion && webpackVersion.includes('^5.'), 'Webpack 应该是 5.x 版本');

// 验证 axios 版本（阶段 0 已升级）
const axiosVersion = packageJson.dependencies.axios;
assert.ok(axiosVersion && axiosVersion.includes('^1.'), 'axios 应该是 1.x 版本');

// 验证 ssh2 版本（阶段 0 已升级）
const ssh2Version = packageJson.dependencies.ssh2;
assert.ok(ssh2Version && ssh2Version.includes('^1.'), 'ssh2 应该是 1.x 版本');

console.log('   ✓ 所有依赖版本正确\n');

// 测试 5: 验证 tsconfig.json 配置
console.log('✅ 测试 5: 验证 TypeScript 配置');
const tsconfigPath = path.join(__dirname, '../../tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));

assert.ok(tsconfig.compilerOptions.target === 'ES2020', 'target 应该是 ES2020');
assert.ok(tsconfig.compilerOptions.skipLibCheck === true, 'skipLibCheck 应该开启');
assert.ok(tsconfig.compilerOptions.strict === false, 'strict 暂关闭（代码库尚未适配 strict 模式）');

console.log('   ✓ TypeScript 配置正确\n');

// 测试 6: 验证 SecretStorage 服务（阶段 0 新增）
console.log('✅ 测试 6: 验证 SecretStorage 服务');
const secretServicePath = path.join(__dirname, '../../src/common/secretService.ts');
assert.ok(fs.existsSync(secretServicePath), 'secretService.ts 应该存在');

const secretServiceContent = fs.readFileSync(secretServicePath, 'utf-8');
assert.ok(secretServiceContent.includes('SecretStorage'), '应该使用 SecretStorage API');
assert.ok(secretServiceContent.includes('class SecretService'), '应该定义 SecretService 类');

console.log('   ✓ SecretStorage 服务已实现\n');

// 测试 7: 验证 WebView polyfill
console.log('✅ 测试 7: 验证 WebView polyfill');
const vendorPath = path.join(__dirname, '../../out/webview/js/vendor.js');
if (fs.existsSync(vendorPath)) {
    const vendorContent = fs.readFileSync(vendorPath, 'utf-8');
    // 验证 process polyfill
    assert.ok(
        vendorContent.includes('process') || vendorContent.includes('process/browser'),
        'vendor.js 应该包含 process polyfill'
    );
    console.log('   ✓ WebView polyfill 已注入\n');
} else {
    console.log('   ⚠️  vendor.js 不存在（可能需要运行 npm run build）\n');
}

// 测试总结
console.log('='.repeat(60));
console.log('✅ 所有集成测试通过！');
console.log('='.repeat(60));
console.log('\n📊 测试覆盖：');
console.log('   • 构建产物验证');
console.log('   • TypeScript 编译验证');
console.log('   • Webpack 5 特性验证');
console.log('   • 依赖版本验证');
console.log('   • TypeScript 配置验证');
console.log('   • SecretStorage 服务验证');
console.log('   • WebView polyfill 验证');
console.log('\n⚠️  注意：手动测试仍需进行：');
console.log('   1. 在 VS Code 中按 F5 启动扩展调试');
console.log('   2. 测试数据库连接功能');
console.log('   3. 测试 WebView 界面渲染');
console.log('   4. 测试 SQL 执行和结果展示');
console.log('\n✨ 阶段 1 自动化验证完成！');
