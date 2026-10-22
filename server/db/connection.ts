import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { env } from '../env';

let connection: Database.Database | null = null;

export function getDb(): Database.Database {
  if (connection) return connection;

  fs.mkdirSync(path.dirname(env.dbPath), { recursive: true });

  const db = new Database(env.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  connection = db;
  return db;
}

export function closeDb(): void {
  connection?.close();
  connection = null;
}
