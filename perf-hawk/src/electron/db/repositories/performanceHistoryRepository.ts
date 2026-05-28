import type Database from 'better-sqlite3';

export type PerformanceHistoryRecord = {
    id: number;
    sampledAt: string;
    cpuUsage: number;
    ramUsage: number;
    storageUsage: number;
    createdAt: string;
};

export type NewPerformanceHistoryRecord = {
    sampledAt: string;
    cpuUsage: number;
    ramUsage: number;
    storageUsage: number;
};

export class PerformanceHistoryRepository {
    constructor(private readonly db: Database.Database) {}

    insert(_record: NewPerformanceHistoryRecord): number {
        // Repository contract is intentionally defined first.
        // Implementation will be added with the history CRUD feature.
        throw new Error('Not implemented yet.');
    }

    findByRange(_fromIsoUtc: string, _toIsoUtc: string): PerformanceHistoryRecord[] {
        throw new Error('Not implemented yet.');
    }

    deleteOlderThan(_isoUtc: string): number {
        throw new Error('Not implemented yet.');
    }

    getDatabase(): Database.Database {
        return this.db;
    }
}

