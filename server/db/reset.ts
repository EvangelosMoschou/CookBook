/**
 * Drops the local database and re-applies migrations.
 * Run with: npm run db:reset
 */
import fs from 'node:fs';
import { env } from '../env';
import { closeDb } from './connection';
import { migrate } from './migrate';

closeDb();

for (const suffix of ['', '-wal', '-shm']) {
  const file = `${env.dbPath}${suffix}`;
  if (fs.existsSync(file)) fs.rmSync(file);
}

const { applied } = migrate();
console.log(`database reset at ${env.dbPath}`);
console.log(`migrations applied: ${applied.join(', ') || 'none'}`);
