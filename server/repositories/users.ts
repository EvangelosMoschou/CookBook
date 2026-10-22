import { getDb } from '../db/connection';
import type { User, VerificationStatus } from '../domain/types';

interface UserRow {
  id: number;
  handle: string;
  display_name: string;
  verification_status: VerificationStatus;
  has_ban: number;
  created_at: string;
}

const toUser = (row: UserRow): User => ({
  id: row.id,
  handle: row.handle,
  displayName: row.display_name,
  verificationStatus: row.verification_status,
  hasBan: row.has_ban === 1,
  createdAt: row.created_at,
});

export function findByHandle(handle: string): User | null {
  const row = getDb().prepare('SELECT * FROM users WHERE handle = ?').get(handle) as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function findById(id: number): User | null {
  const row = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function countUsers(): number {
  const { total } = getDb().prepare('SELECT COUNT(*) AS total FROM users').get() as { total: number };
  return total;
}
