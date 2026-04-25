import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.SQLITE_PATH || join(__dirname, '..', 'data', 'healthhub.db');

let db;

export function getDb() {
  if (!db) {
    try { mkdirSync(join(dirname(dbPath)), { recursive: true }); } catch (_) {}
    db = new DatabaseSync(dbPath);
  }
  return db;
}

export function initDb() {
  try { mkdirSync(join(dirname(dbPath)), { recursive: true }); } catch (_) {}
  db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      careconnect_patient_id TEXT,
      medtrack_user_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  return db;
}
