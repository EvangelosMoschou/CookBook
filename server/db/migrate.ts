import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getDb } from './connection';

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

export interface MigrationResult {
  applied: string[];
  skipped: string[];
}

export function migrate(): MigrationResult {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const done = new Set(
    db.prepare('SELECT version FROM schema_migrations').all().map((row) => (row as { version: string }).version),
  );

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const applied: string[] = [];
  const skipped: string[] = [];
  const record = db.prepare('INSERT INTO schema_migrations (version) VALUES (?)');

  for (const file of files) {
    if (done.has(file)) {
      skipped.push(file);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.transaction(() => {
      db.exec(sql);
      record.run(file);
    })();
    applied.push(file);
  }

  return { applied, skipped };
}

const isDirectRun =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  const { applied, skipped } = migrate();
  console.log(`migrations applied: ${applied.length ? applied.join(', ') : 'none'}`);
  console.log(`already up to date: ${skipped.length ? skipped.join(', ') : 'none'}`);
}
