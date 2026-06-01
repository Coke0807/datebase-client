/**
 * H2 Database TCP Protocol Client — pure TypeScript implementation.
 *
 * Implements H2's native binary TCP wire protocol (version 20, H2 2.x).
 * No Java or JDBC dependency required — connects directly to
 * `java -cp h2.jar org.h2.tools.Server -tcp -tcpPort 9092`.
 *
 * Protocol reference: org.h2.server.TcpServerThread / org.h2.engine.SessionRemote
 */

import * as net from 'net';
import * as crypto from 'crypto';

// ── Protocol Constants ───────────────────────────────────────────────────────

const PROTOCOL_VERSION = 20;

// Commands (SessionRemote)
const CMD_CLOSE = 0;
const CMD_EXECUTE_QUERY = 1;
const CMD_EXECUTE_UPDATE = 2;

// Status codes
const STATUS_OK = 0;
const STATUS_ERROR = 1;

// Row markers
const ROW_DATA = 1;
const ROW_END = 0;

// H2 2.x Value Types (org.h2.value.Value)
const VT_NULL = 0;
const VT_BOOLEAN = 1;
const VT_TINYINT = 2;
const VT_SMALLINT = 3;
const VT_INTEGER = 4;
const VT_BIGINT = 5;
const VT_NUMERIC = 6;
const VT_DOUBLE = 7;
const VT_REAL = 8;
const VT_TIME = 9;
const VT_TIME_TZ = 10;
const VT_DATE = 11;
const VT_TIMESTAMP = 12;
const VT_TIMESTAMP_TZ = 13;
const VT_BYTES = 14;
const VT_STRING = 15;
const VT_STRING_IGNORECASE = 16;
const VT_BLOB = 17;
const VT_CLOB = 18;
const VT_ARRAY = 19;
const VT_ROW = 20;
const VT_RESULT_SET = 21;
const VT_JAVA_OBJECT = 22;
const VT_UUID = 23;
const VT_CHAR = 24;
const VT_JSON = 25;
const VT_ENUM = 26;
const VT_GEOMETRY = 27;
const VT_FLOAT = 28; // alias for DOUBLE in some H2 contexts

// ── Types ────────────────────────────────────────────────────────────────────

export interface ColumnMeta {
    name: string;
    valueType: number;
    precision: number;
    scale: number;
}

export interface QueryResult {
    columns: ColumnMeta[];
    rows: any[][];
}

export interface UpdateResult {
    affectedRows: number;
}

// ── H2TcpClient ──────────────────────────────────────────────────────────────

export class H2TcpClient {
    private socket: net.Socket | null = null;
    private dataQueue: Buffer[] = [];
    private queuedBytes = 0;
    private readResolve: (() => void) | null = null;
    private readReject: ((err: Error) => void) | null = null;
    private closed = false;
    private nextObjectId = 0;
    private writeBuf: Buffer[] = [];

    constructor(private host: string, private port: number) {}

    // ── Public API ───────────────────────────────────────────────────────

    /** Open TCP connection and authenticate with the H2 server. */
    async connect(database: string, user: string, password: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.socket = net.connect(this.port, this.host);

            this.socket.on('connect', async () => {
                try {
                    await this.authenticate(database, user, password);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });

            this.socket.on('data', (data: Buffer) => {
                this.dataQueue.push(data);
                this.queuedBytes += data.length;
                if (this.readResolve) {
                    const r = this.readResolve;
                    this.readResolve = null;
                    r();
                }
            });

            this.socket.on('error', (err: Error) => {
                this.closed = true;
                if (this.readReject) {
                    const r = this.readReject;
                    this.readReject = null;
                    r(err);
                }
            });

            this.socket.on('close', () => {
                this.closed = true;
                if (this.readResolve) {
                    const r = this.readResolve;
                    this.readResolve = null;
                    r();
                }
            });
        });
    }

    /** Execute a SELECT-style query that returns rows. */
    async executeQuery(sql: string, maxRows = -1): Promise<QueryResult> {
        const objectId = this.nextObjectId++;

        this.writeReset();
        this.writeInt(CMD_EXECUTE_QUERY);
        this.writeString(sql);
        this.writeInt(objectId);
        this.writeInt(maxRows);
        await this.writeFlush();

        // Server may send status error or column metadata
        const status = await this.readInt();
        if (status === STATUS_ERROR) {
            throw await this.readError();
        }

        const columnCount = await this.readInt();
        const columns: ColumnMeta[] = [];
        for (let i = 0; i < columnCount; i++) {
            columns.push({
                name: await this.readString(),
                valueType: await this.readInt(),
                precision: this.longToNumber(await this.readRawLong()),
                scale: await this.readInt(),
            });
        }

        const rows: any[][] = [];
        while (true) {
            const marker = await this.readInt();
            if (marker === ROW_END) break;
            const row: any[] = [];
            for (let i = 0; i < columnCount; i++) {
                row.push(await this.readValue());
            }
            rows.push(row);
        }

        return { columns, rows };
    }

    /** Execute an INSERT/UPDATE/DELETE statement that returns affected row count. */
    async executeUpdate(sql: string): Promise<number> {
        const objectId = this.nextObjectId++;

        this.writeReset();
        this.writeInt(CMD_EXECUTE_UPDATE);
        this.writeString(sql);
        this.writeInt(objectId);
        await this.writeFlush();

        const status = await this.readInt();
        if (status === STATUS_ERROR) {
            throw await this.readError();
        }

        return this.longToNumber(await this.readRawLong());
    }

    /** Gracefully close the TCP connection. */
    close(): void {
        this.closed = true;
        try {
            // Best-effort close command
            if (this.socket && !this.socket.destroyed) {
                const buf = Buffer.alloc(4);
                buf.writeInt32BE(CMD_CLOSE, 0);
                this.socket.write(buf);
                this.socket.end();
            }
        } catch { /* ignore */ }
        this.socket = null;
    }

    isClosed(): boolean {
        return this.closed;
    }

    // ── Authentication ───────────────────────────────────────────────────

    private async authenticate(database: string, user: string, password: string): Promise<void> {
        // Phase 1: Client sends handshake
        this.writeReset();
        this.writeInt(PROTOCOL_VERSION);
        this.writeString('');          // sessionId — empty for new connection
        this.writeString(database);
        this.writeString(user);
        await this.writeFlush();

        // Phase 2: Server responds with version, sessionId, challenge
        const _serverVersion = await this.readInt();
        const _sessionId = await this.readString();
        const challenge = await this.readString();

        // Phase 3: Compute password hash and send
        let encryptedPassword = '';
        if (password) {
            // H2 auth: SHA-256( SHA-256(password_bytes + user_bytes) + challenge_bytes )
            const passwordBytes = Buffer.from(password, 'utf-8');
            const userBytes = Buffer.from(user, 'utf-8');
            const challengeBytes = Buffer.from(challenge, 'hex');

            const innerHash = crypto.createHash('sha256')
                .update(passwordBytes)
                .update(userBytes)
                .digest();
            const outerHash = crypto.createHash('sha256')
                .update(innerHash)
                .update(challengeBytes)
                .digest();
            encryptedPassword = outerHash.toString('hex');
        }

        this.writeReset();
        this.writeString(encryptedPassword);
        await this.writeFlush();

        // Phase 4: Server responds with status
        const status = await this.readInt();
        if (status !== STATUS_OK) {
            const msg = await this.readString();
            throw new Error(`H2 TCP authentication failed: ${msg}`);
        }
    }

    // ── Error Handling ───────────────────────────────────────────────────

    private async readError(): Promise<Error> {
        const sqlState = await this.readString();
        const message = await this.readString();
        await this.readString(); // sql (always empty)
        const errorCode = await this.readInt();
        const _stackTrace = await this.readString();
        return new Error(`H2 error [${errorCode}/${sqlState}]: ${message}`);
    }

    // ── Value Reading ────────────────────────────────────────────────────

    private async readValue(): Promise<any> {
        const valueType = await this.readInt();
        switch (valueType) {
            case VT_NULL:
                return null;
            case VT_BOOLEAN:
                return (await this.readRawByte()) !== 0;
            case VT_TINYINT:
            case VT_SMALLINT:
            case VT_INTEGER:
                return await this.readInt();
            case VT_BIGINT:
                return this.longToNumber(await this.readRawLong());
            case VT_NUMERIC:
            case VT_CHAR:
            case VT_STRING:
            case VT_STRING_IGNORECASE:
            case VT_CLOB:
            case VT_JSON:
            case VT_UUID:
            case VT_ENUM:
            case VT_GEOMETRY:
                return await this.readString();
            case VT_DOUBLE:
            case VT_FLOAT: // H2 uses FLOAT as alias for DOUBLE in some contexts
                return await this.readDouble();
            case VT_REAL:
                return await this.readFloat();
            case VT_TIME:
            case VT_DATE:
            case VT_TIMESTAMP:
                return new Date(this.longToNumber(await this.readRawLong()));
            case VT_TIME_TZ:
            case VT_TIMESTAMP_TZ: {
                const millis = this.longToNumber(await this.readRawLong());
                const _offsetMinutes = await this.readInt();
                return new Date(millis);
            }
            case VT_BYTES:
            case VT_BLOB:
                return await this.readBlob();
            default:
                // Fallback: try reading as string
                return await this.readString();
        }
    }

    // ── Low-Level Binary I/O ─────────────────────────────────────────────

    // -- Read helpers (async, buffered) --

    /** Block until at least `count` bytes are available, then consume them. */
    private async readExact(count: number): Promise<Buffer> {
        while (this.queuedBytes < count) {
            if (this.closed) throw new Error('H2 TCP connection closed unexpectedly');
            await new Promise<void>((resolve, reject) => {
                this.readResolve = resolve;
                this.readReject = reject;
            });
        }
        return this.consumeFromQueue(count);
    }

    private consumeFromQueue(count: number): Buffer {
        const result = Buffer.allocUnsafe(count);
        let offset = 0;
        while (offset < count) {
            const buf = this.dataQueue[0];
            const available = buf.length;
            const need = count - offset;
            if (available <= need) {
                buf.copy(result, offset);
                this.dataQueue.shift();
                this.queuedBytes -= available;
                offset += available;
            } else {
                buf.copy(result, offset, 0, need);
                this.dataQueue[0] = buf.subarray(need);
                this.queuedBytes -= need;
                offset += need;
            }
        }
        return result;
    }

    private async readInt(): Promise<number> {
        const buf = await this.readExact(4);
        return buf.readInt32BE(0);
    }

    private async readRawLong(): Promise<Buffer> {
        return await this.readExact(8);
    }

    private async readRawByte(): Promise<number> {
        const buf = await this.readExact(1);
        return buf[0];
    }

    private async readDouble(): Promise<number> {
        const buf = await this.readExact(8);
        return buf.readDoubleBE(0);
    }

    private async readFloat(): Promise<number> {
        const buf = await this.readExact(4);
        return buf.readFloatBE(0);
    }

    private async readString(): Promise<string | null> {
        const len = await this.readInt();
        if (len === -1) return null;
        if (len === 0) return '';
        const buf = await this.readExact(len);
        return buf.toString('utf-8');
    }

    private async readBlob(): Promise<Buffer | null> {
        const len = await this.readInt();
        if (len === -1) return null;
        if (len === 0) return Buffer.alloc(0);
        return await this.readExact(len);
    }

    // -- Write helpers (buffered, flushed together) --

    private writeReset(): void {
        this.writeBuf = [];
    }

    private writeInt(value: number): void {
        const buf = Buffer.allocUnsafe(4);
        buf.writeInt32BE(value, 0);
        this.writeBuf.push(buf);
    }

    private writeString(value: string | null): void {
        if (value === null || value === undefined) {
            this.writeInt(-1);
            return;
        }
        const bytes = Buffer.from(value, 'utf-8');
        this.writeInt(bytes.length);
        this.writeBuf.push(bytes);
    }

    private async writeFlush(): Promise<void> {
        if (!this.socket || this.socket.destroyed) {
            throw new Error('H2 TCP socket is not connected');
        }
        const payload = Buffer.concat(this.writeBuf);
        this.writeBuf = [];
        return new Promise<void>((resolve, reject) => {
            this.socket!.write(payload, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // ── Utilities ────────────────────────────────────────────────────────

    /** Convert an 8-byte big-endian buffer to a JavaScript number. */
    private longToNumber(buf: Buffer): number {
        const high = buf.readInt32BE(0);
        const low = buf.readUInt32BE(4);
        return high * 0x100000000 + low;
    }
}
