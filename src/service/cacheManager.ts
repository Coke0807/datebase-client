/**
 * 缓存管理器
 * 管理缓存生命周期和清理策略
 */
import { DatabaseCache } from "./common/databaseCache";

export class CacheManager {
    private static instance: CacheManager;
    private cacheExpiry: Map<string, number> = new Map();
    private defaultTTL: number = 30 * 60 * 1000; // 30 minutes

    private constructor() {}

    static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    /**
     * 设置缓存过期时间
     */
    setExpiry(key: string, ttl: number = this.defaultTTL): void {
        this.cacheExpiry.set(key, Date.now() + ttl);
    }

    /**
     * 检查缓存是否过期
     */
    isExpired(key: string): boolean {
        const expiry = this.cacheExpiry.get(key);
        if (!expiry) return false;
        return Date.now() > expiry;
    }

    /**
     * 清理过期缓存
     */
    cleanupExpired(): void {
        for (const [key, expiry] of this.cacheExpiry.entries()) {
            if (Date.now() > expiry) {
                this.cacheExpiry.delete(key);
            }
        }
    }

    /**
     * 清理所有缓存
     */
    clearAll(): void {
        this.cacheExpiry.clear();
    }

    /**
     * 设置默认 TTL
     */
    setDefaultTTL(ttl: number): void {
        this.defaultTTL = ttl;
    }
}
