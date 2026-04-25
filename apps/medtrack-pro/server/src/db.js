import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.SQLITE_PATH || join(__dirname, '..', 'data', 'medtrack.db');

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
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      instructions TEXT,
      refill_reminder_days INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      medication_id TEXT NOT NULL,
      time_of_day TEXT NOT NULL,
      days_mask INTEGER DEFAULT 127,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS dosage_logs (
      id TEXT PRIMARY KEY,
      medication_id TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      taken_at TEXT,
      skipped INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  return db;
}
