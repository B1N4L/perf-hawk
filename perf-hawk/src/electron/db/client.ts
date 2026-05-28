import Database from 'better-sqlite3';

import {
    ensureDatabaseDirectoryExists,
    getDatabasePath,
} from './config.js';

let database: Database.Database | null = null;

export function openDatabase(): Database.Database {
    if (database) {
        return database;
    }

    ensureDatabaseDirectoryExists();
    const db = new Database(getDatabasePath());

    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');

    database = db;
    return db;
}

export function getDatabase(): Database.Database {
    if (!database) {
        throw new Error('Database has not been initialized yet.');
    }

    return database;
}

export function closeDatabase(): void {
    if (!database) {
        return;
    }

    database.close();
    database = null;
}

