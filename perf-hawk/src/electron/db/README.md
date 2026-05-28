# Database Layer

This folder contains the SQLite foundation for the Electron main process.

## Structure

- `config.ts`: database path and directory bootstrap logic.
- `client.ts`: singleton `better-sqlite3` connection lifecycle.
- `schema.ts`: SQL schema definitions.
- `migrations.ts`: idempotent migration runner.
- `index.ts`: public initialization/shutdown entry points.
- `repositories/`: repository contracts and CRUD modules.

## Current behavior

- Database file path defaults to `C:/perf-hawk/db/perf-hawk.sqlite`.
- Override location with `PERF_HAWK_DB_DIR`.
- Startup calls `initializeDatabase()` from `src/electron/main.ts`.
- Shutdown calls `shutdownDatabase()` on `before-quit`.

## Next step

Implement `PerformanceHistoryRepository` methods and wire writes from
`pollResources()` plus read APIs over IPC.

## Smoke test

Run the database initialization check:

`npm run db:smoke`


