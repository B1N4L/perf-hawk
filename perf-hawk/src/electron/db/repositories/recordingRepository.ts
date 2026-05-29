import type Database from 'better-sqlite3';

export type NewSample = {
    sampledAt: string;
    cpuUsage: number;
    ramUsage: number;
    storageUsage: number;
};

export class RecordingRepository {
    private insertSampleStmt: Database.Statement | null = null;

    constructor(private readonly db: Database.Database) {}

    // Inserts a row into recording_sessions with mode and snapshot fields
    createSession(mode: 'manual' | 'background', snapshot: { cpuModel?: string; totalMemGB?: number; totalStorageGB?: number }): number {
        const stmt = this.db.prepare(`
            INSERT INTO recording_sessions (mode, started_at, cpu_model, total_mem_gb, total_storage_gb)
            VALUES (?, datetime('now'), ?, ?, ?);
        `);

        const info = stmt.run(mode, snapshot.cpuModel ?? null, snapshot.totalMemGB ?? null, snapshot.totalStorageGB ?? null);
        return Number(info.lastInsertRowid);
    }

    // Lazily prepares insertSampleStmt if not initialized. (one session has many samples)
    insertSamples(sessionId: number, samples: NewSample[]): number {
        if (samples.length === 0) return 0;

        if (!this.insertSampleStmt) {
            this.insertSampleStmt = this.db.prepare(`
                INSERT INTO performance_samples (session_id, sampled_at, cpu_usage, ram_usage, storage_usage)
                VALUES (?, ?, ?, ?, ?);
            `);
        }

        const insertTx = this.db.transaction((rows: NewSample[]) => {
            for (const r of rows) {
                this.insertSampleStmt!.run(sessionId, r.sampledAt, r.cpuUsage, r.ramUsage, r.storageUsage);
            }
        });

        insertTx(samples);
        return samples.length;
    }

    closeSession(sessionId: number): void {
        const stmt = this.db.prepare(`UPDATE recording_sessions SET stopped_at = datetime('now') WHERE id = ?;`);
        stmt.run(sessionId);
    }

    getSampleCount(sessionId: number): number {
        const count = this.db.prepare(`SELECT COUNT(1) FROM performance_samples WHERE session_id = ?;`).pluck().get(sessionId) as number | undefined;
        return Number(count ?? 0);
    }
}

