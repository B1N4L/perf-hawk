import { closeDatabase, openDatabase } from './client.js';
import { getDatabasePath } from './config.js';
import { runMigrations } from './migrations.js';

export function initializeDatabase(): { dbPath: string } {
    const db = openDatabase();
    runMigrations(db);

    return {
        dbPath: getDatabasePath(),
    };
}

export function shutdownDatabase(): void {
    closeDatabase();
}

