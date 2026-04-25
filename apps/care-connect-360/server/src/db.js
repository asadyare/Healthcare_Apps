import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.SQLITE_PATH || join(__dirname, '..', 'data', 'careconnect.db');

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
      role TEXT NOT NULL DEFAULT 'provider',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      provider_id TEXT,
      external_user_id TEXT,
      name TEXT NOT NULL,
      email TEXT,
      date_of_birth TEXT,
      address TEXT,
      medical_history TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS care_plans (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      read_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  return db;
}
