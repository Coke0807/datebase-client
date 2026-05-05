/**
 * 安全扫描测试
 * 验证 npm audit 扫描结果是否正确生成
 */

const fs = require('fs');
const path = require('path');

describe('Security Audit Tests', () => {
    const projectRoot = path.resolve(__dirname, '../../');
    
    test('应该生成 security-audit-report.txt 文件', () => {
        const filePath = path.join(projectRoot, 'security-audit-report.txt');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    test('security-audit-report.txt 应该包含漏洞信息', () => {
        const filePath = path.join(projectRoot, 'security-audit-report.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 验证包含关键漏洞信息
        expect(content).toContain('axios');
        expect(content).toContain('ssh2');
        expect(content).toContain('mysql2');
        expect(content).toContain('Severity:');
    });

    test('应该生成 dependency-outdated.txt 文件', () => {
        const filePath = path.join(projectRoot, 'dependency-outdated.txt');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    test('dependency-outdated.txt 应该包含过时依赖信息', () => {
        const filePath = path.join(projectRoot, 'dependency-outdated.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 验证包含依赖信息
        expect(content).toContain('Package');
        expect(content).toContain('Current');
        expect(content).toContain('Latest');
    });

    test('应该生成 dependency-updates.txt 文件', () => {
        const filePath = path.join(projectRoot, 'dependency-updates.txt');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    test('dependency-updates.txt 应该包含可用更新信息', () => {
        const filePath = path.join(projectRoot, 'dependency-updates.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 验证包含更新信息
        expect(content).toContain('axios');
        expect(content).toContain('ssh2');
        expect(content).toContain('mysql2');
    });

    test('应该生成 security-analysis.md 分析报告', () => {
        const filePath = path.join(projectRoot, 'security-analysis.md');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    test('security-analysis.md 应该包含完整的漏洞分析', () => {
        const filePath = path.join(projectRoot, 'security-analysis.md');
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 验证包含关键分析内容
        expect(content).toContain('Critical');
        expect(content).toContain('High');
        expect(content).toContain('mysql2');
        expect(content).toContain('axios');
        expect(content).toContain('ssh2');
        expect(content).toContain('修复计划');
    });

    test('应该识别出 Critical 级别漏洞', () => {
        const filePath = path.join(projectRoot, 'security-audit-report.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        
        expect(content).toContain('Severity: critical');
    });

    test('应该识别出 mysql2 的 RCE 漏洞', () => {
        const filePath = path.join(projectRoot, 'security-audit-report.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        
        expect(content).toContain('mysql2');
        expect(content).toContain('Remote Code Execution');
    });

    test('应该识别出 axios 的 SSRF 漏洞', () => {
        const filePath = path.join(projectRoot, 'security-audit-report.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        
        expect(content).toContain('axios');
        expect(content).toContain('SSRF');
    });

    test('应该识别出 ssh2 的命令注入漏洞', () => {
        const filePath = path.join(projectRoot, 'security-audit-report.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        
        expect(content).toContain('ssh2');
        expect(content).toContain('Command Injection');
    });
});
