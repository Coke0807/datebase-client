/**
 * Provider 注册表
 * 管理 VS Code Provider 的注册和生命周期
 */
import * as vscode from "vscode";

export class ProviderRegistry {
    private providers: Map<string, vscode.Disposable> = new Map();

    /**
     * 注册 Provider
     */
    register<T extends vscode.Disposable>(name: string, provider: T): T {
        this.providers.set(name, provider);
        return provider;
    }

    /**
     * 获取 Provider
     */
    get<T extends vscode.Disposable>(name: string): T | undefined {
        return this.providers.get(name) as T;
    }

    /**
     * 注销所有 Provider
     */
    dispose(): void {
        for (const provider of this.providers.values()) {
            provider.dispose();
        }
        this.providers.clear();
    }
}
