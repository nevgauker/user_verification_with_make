import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./db/data.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Function to initialize the database and ensure the users table exists
function initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        hashed_password TEXT,
        status TEXT DEFAULT 'UNVERIFIED',
        verification_token TEXT,
        token_expires_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
            if (err) {
                console.error('Error creating table:', err);
                reject(err);
            } else {
                console.log('Users table is ready');
                resolve();
            }
        });
    });
}

export async function initialize() {
    await initializeDatabase();
}

export { db };
