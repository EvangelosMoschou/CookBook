import { getDb } from '../db/connection';
import type { Comment } from '../domain/types';

interface CommentRow {
  id: number;
  recipe_id: number;
  author: string;
  text: string;
  created_at: string;
}

const toComment = (row: CommentRow): Comment => ({
  id: row.id,
  recipeId: row.recipe_id,
  author: row.author,
  text: row.text,
  createdAt: row.created_at,
});

export function listComments(recipeId: number): Comment[] {
  const rows = getDb()
    .prepare(
      `SELECT id, recipe_id, author, text, created_at
         FROM comments
        WHERE recipe_id = ?
        ORDER BY created_at DESC, id DESC`,
    )
    .all(recipeId) as CommentRow[];

  return rows.map(toComment);
}

export function createComment(input: {
  recipeId: number;
  userId: number | null;
  author: string;
  text: string;
}): Comment {
  const info = getDb()
    .prepare(
      `INSERT INTO comments (recipe_id, user_id, author, text) VALUES (?, ?, ?, ?)`,
    )
    .run(input.recipeId, input.userId, input.author, input.text);

  const row = getDb()
    .prepare('SELECT id, recipe_id, author, text, created_at FROM comments WHERE id = ?')
    .get(Number(info.lastInsertRowid)) as CommentRow;

  return toComment(row);
}

export function countComments(): number {
  const { total } = getDb().prepare('SELECT COUNT(*) AS total FROM comments').get() as { total: number };
  return total;
}
