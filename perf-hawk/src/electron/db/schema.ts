export const INITIAL_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS recording_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL CHECK(mode IN ('manual','background')),
    started_at TEXT NOT NULL,
    stopped_at TEXT,
    cpu_model TEXT,
    total_mem_gb INTEGER,
    total_storage_gb INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS performance_samples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES recording_sessions(id) ON DELETE CASCADE,
    sampled_at TEXT NOT NULL,
    cpu_usage REAL NOT NULL CHECK(cpu_usage >= 0 AND cpu_usage <= 1),
    ram_usage REAL NOT NULL CHECK(ram_usage >= 0 AND ram_usage <= 1),
    storage_usage REAL NOT NULL CHECK(storage_usage >= 0 AND storage_usage <= 1),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recording_session_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES recording_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK(event_type IN ('start','pause','resume','stop')),
    event_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_performance_samples_session_sampled_at
ON performance_samples(session_id, sampled_at);

CREATE INDEX IF NOT EXISTS idx_recording_session_events_session_event_at
ON recording_session_events(session_id, event_at);
`;

