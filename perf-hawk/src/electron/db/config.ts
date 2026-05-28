import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_DB_DIRECTORY = 'C:/perf-hawk/db';
const DB_FILE_NAME = 'perf-hawk.sqlite';

export function getDatabaseDirectory(): string {
    return process.env.PERF_HAWK_DB_DIR ?? DEFAULT_DB_DIRECTORY;
}

export function getDatabasePath(): string {
    return path.join(getDatabaseDirectory(), DB_FILE_NAME);
}

export function ensureDatabaseDirectoryExists(): void {
    fs.mkdirSync(getDatabaseDirectory(), { recursive: true });
}

