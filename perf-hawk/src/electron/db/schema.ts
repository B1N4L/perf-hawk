export const INITIAL_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS performance_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sampled_at TEXT NOT NULL,
    cpu_usage REAL NOT NULL CHECK(cpu_usage >= 0 AND cpu_usage <= 1),
    ram_usage REAL NOT NULL CHECK(ram_usage >= 0 AND ram_usage <= 1),
    storage_usage REAL NOT NULL CHECK(storage_usage >= 0 AND storage_usage <= 1),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_performance_history_sampled_at
ON performance_history(sampled_at);
`;

