import type Database from 'better-sqlite3';

import { INITIAL_SCHEMA_SQL } from './schema.js';

const INITIAL_MIGRATION_ID = '20260528_000001_session_schema';

function ensureMigrationTable(db: Database.Database): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            migration_id TEXT NOT NULL UNIQUE,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);
}

function hasMigration(db: Database.Database, migrationId: string): boolean {
    const row = db
        .prepare(
            `SELECT 1 FROM schema_migrations WHERE migration_id = ? LIMIT 1;`
        )
        .get(migrationId);

    return Boolean(row);
}

export function runMigrations(db: Database.Database): void {
    ensureMigrationTable(db);

    if (hasMigration(db, INITIAL_MIGRATION_ID)) {
        return;
    }

    const migrationTx = db.transaction(() => {
        // If an old flat table exists, remove it. We're replacing it with a session-based schema.
        db.exec(`DROP TABLE IF EXISTS performance_history;`);
        db.exec(INITIAL_SCHEMA_SQL);
        db.prepare(
            `INSERT INTO schema_migrations (migration_id) VALUES (?);`
        ).run(INITIAL_MIGRATION_ID);
    });

    migrationTx();
}

