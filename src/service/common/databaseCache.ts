import { GlobalState, WorkState } from "@/common/state";
import { ExtensionContext, TreeItemCollapsibleState } from "vscode";
import { CacheKey, ModelType } from "../../common/constants";
import { SchemaNode } from "../../model/database/schemaNode";
import { Node } from "../../model/interface/node";

export class DatabaseCache {

    private static cache = { database: {} };
    private static childCache = {};
    private static childCacheTimestamps: { [key: string]: number } = {};
    private static globalCollpaseState: { key?: TreeItemCollapsibleState };
    private static workspaceCollpaseState: { key?: TreeItemCollapsibleState };

    /** T-06: Maximum number of child cache entries before LRU eviction */
    private static readonly MAX_CHILD_CACHE_SIZE = 500;
    /** T-06: TTL for child cache entries in milliseconds (5 minutes) */
    private static readonly CHILD_CACHE_TTL = 5 * 60 * 1000;

    /**
     * get element current collapseState or default collapseState
     * @param element 
     */
    public static getElementState(element?: Node) {

        const contextValue = element.contextValue;
        if (!contextValue || contextValue === ModelType.COLUMN || contextValue === ModelType.INFO || contextValue === ModelType.FUNCTION
            || contextValue === ModelType.TRIGGER || contextValue === ModelType.PROCEDURE || contextValue === ModelType.USER
            || contextValue === ModelType.DIAGRAM || contextValue === ModelType.ES_COLUMN || contextValue === ModelType.COLUMN
        ) {
            return TreeItemCollapsibleState.None;
        }

        const collpaseState = element.global === false ? this.workspaceCollpaseState : this.globalCollpaseState;

        if (element.uid && collpaseState[element.uid]) {
            return collpaseState[element.uid];
        } else if (contextValue === ModelType.CONNECTION || contextValue === ModelType.TABLE_GROUP) {
            return TreeItemCollapsibleState.Expanded;
        } else {
            return TreeItemCollapsibleState.Collapsed;
        }

    }


    /**
     * update tree node collapseState
     * @param element 
     * @param collapseState 
     */
    public static storeElementState(element?: Node, collapseState?: TreeItemCollapsibleState) {

        if (element.contextValue === ModelType.COLUMN || element.contextValue === ModelType.INFO) {
            return;
        }

        if (element.global === false) {
            this.workspaceCollpaseState[element.uid] = collapseState;
            WorkState.update(CacheKey.DATABASE_SATE, this.globalCollpaseState);
        } else {
            this.globalCollpaseState[element.uid] = collapseState;
            GlobalState.update(CacheKey.DATABASE_SATE, this.globalCollpaseState);
        }

    }

    /**
     * cache init, Mainly initializing context object
     */
    public static initCache() {
        this.globalCollpaseState = GlobalState.get(CacheKey.DATABASE_SATE, {});
        this.workspaceCollpaseState = WorkState.get(CacheKey.DATABASE_SATE, {});
    }

    public static clearCache() {
        this.childCache = {}
        this.childCacheTimestamps = {}
        this.cache.database = {}
    }


    public static setChildCache(uid: string, tableNodeList: Node[]) {
        // T-06: Evict oldest entries if cache exceeds max size
        const keys = Object.keys(this.childCache);
        if (keys.length >= DatabaseCache.MAX_CHILD_CACHE_SIZE) {
            // Sort by timestamp and remove oldest 20%
            const sorted = keys.sort((a, b) =>
                (this.childCacheTimestamps[a] || 0) - (this.childCacheTimestamps[b] || 0)
            );
            const evictCount = Math.floor(DatabaseCache.MAX_CHILD_CACHE_SIZE * 0.2);
            for (let i = 0; i < evictCount && i < sorted.length; i++) {
                delete this.childCache[sorted[i]];
                delete this.childCacheTimestamps[sorted[i]];
            }
        }
        this.childCache[uid] = tableNodeList;
        this.childCacheTimestamps[uid] = Date.now();
    }

    public static getChildCache<T extends Node>(uid: string): T[] {
        // T-06: Check TTL before returning cached data
        const timestamp = this.childCacheTimestamps[uid];
        if (timestamp && (Date.now() - timestamp > DatabaseCache.CHILD_CACHE_TTL)) {
            delete this.childCache[uid];
            delete this.childCacheTimestamps[uid];
            return null;
        }
        return this.childCache[uid];
    }

    /**
     * clear database data for connection
     * @param connectionid 
     */
    public static clearDatabaseCache(connectionid: string) {
        if (connectionid) {
            delete this.cache.database[connectionid];
            // T-06: Also clean childCache entries belonging to this connection
            const prefix = connectionid + '_';
            for (const key of Object.keys(this.childCache)) {
                if (key.startsWith(prefix)) {
                    delete this.childCache[key];
                    delete this.childCacheTimestamps[key];
                }
            }
        }
    }

    /**
     * support to complection manager
     */
    public static getDatabaseNodeList(): SchemaNode[] {
        let databaseNodeList = [];

        Object.keys(this.cache.database).forEach((key) => {
            const tempList = this.cache.database[key];
            if (tempList) {
                databaseNodeList = databaseNodeList.concat(tempList);
            }
        });

        return databaseNodeList;
    }

    public static setSchemaListOfConnection(connectionid: string, DatabaseNodeList: Node[]) {
        this.cache.database[connectionid] = DatabaseNodeList;
    }

    public static getSchemaListOfConnection(connectcionid: string): SchemaNode[] {
        if (this.cache.database[connectcionid]) {
            return this.cache.database[connectcionid];
        } else {
            return null;
        }
    }



}
