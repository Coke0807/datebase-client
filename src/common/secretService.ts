import * as vscode from "vscode";
import { Global } from "./global";
import { Console } from "./Console";

/**
 * SecretStorage service for secure password storage
 * Provides backward compatibility with legacy Memento storage
 */
export class SecretService {
    private static _instance: SecretService;

    constructor(private secretStorage: vscode.SecretStorage) {}

    /**
     * Initialize SecretService singleton
     */
    static init(context: vscode.ExtensionContext): void {
        SecretService._instance = new SecretService(context.secrets);
    }

    /**
     * Get SecretService instance
     */
    static get instance(): SecretService {
        if (!SecretService._instance) {
            throw new Error("SecretService not initialized. Call SecretService.init(context) first.");
        }
        return SecretService._instance;
    }

    /**
     * Store password securely in SecretStorage
     * @param key Connection key (unique identifier)
     * @param password Password to store
     */
    async storePassword(key: string, password: string): Promise<void> {
        const secretKey = this.getSecretKey(key);
        await this.secretStorage.store(secretKey, password);
        Console.log(`Password stored securely for key: ${key}`);
    }

    /**
     * Retrieve password with backward compatibility
     * Implements dual-read strategy: SecretStorage first, then Memento
     * Automatically migrates legacy passwords to SecretStorage
     * 
     * @param key Connection key
     * @param legacyPassword Password from legacy Memento storage (optional)
     * @returns Password string or undefined
     */
    async getPassword(key: string, legacyPassword?: string): Promise<string | undefined> {
        const secretKey = this.getSecretKey(key);
        
        // 1. Try SecretStorage first
        const secretPassword = await this.secretStorage.get(secretKey);
        if (secretPassword) {
            return secretPassword;
        }

        // 2. Fallback to legacy password (from Memento)
        if (legacyPassword) {
            // Auto-migrate to SecretStorage
            await this.storePassword(key, legacyPassword);
            Console.log(`Migrated password from Memento to SecretStorage for key: ${key}`);
            return legacyPassword;
        }

        return undefined;
    }

    /**
     * Delete password from SecretStorage
     * @param key Connection key
     */
    async deletePassword(key: string): Promise<void> {
        const secretKey = this.getSecretKey(key);
        await this.secretStorage.delete(secretKey);
        Console.log(`Password deleted for key: ${key}`);
    }

    /**
     * Generate secret storage key from connection key
     * Prefix with extension ID to avoid collisions
     */
    private getSecretKey(key: string): string {
        return `cweijan.vscode-database-client.password.${key}`;
    }
}
