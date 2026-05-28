import { app } from 'electron';

import { initializeDatabase, shutdownDatabase } from './index.js';

try {
    const { dbPath } = initializeDatabase();
    console.log(`SQLite smoke test successful: ${dbPath}`);
} catch (error) {
    console.error('SQLite smoke test failed', error);
    shutdownDatabase();
    app.exit(1);
}

shutdownDatabase();
app.exit(0);

