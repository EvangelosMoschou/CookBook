import { getDb } from '../db/connection';
import type { Page, Recipe } from '../domain/types';

interface RecipeRow {
  id: number;
  name: string;
  category: string;
  author: string;
  ingredients: string;
  instructions: string;
  rating: number;
  ranking: number;
  image_url: string | null;
  created_at: string;
}

const toRecipe = (row: RecipeRow): Recipe => ({
  id: row.id,
  name: row.name,
  category: row.category,
  author: row.author,
  ingredients: JSON.parse(row.ingredients) as string[],
  instructions: row.instructions,
  rating: row.rating,
  ranking: row.ranking,
  imageUrl: row.image_url,
  createdAt: row.created_at,
});

export function listRecipes(limit: number, offset: number): Page<Recipe> {
  const db = getDb();
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM recipes').get() as { total: number };
  const rows = db
    .prepare(
      `SELECT * FROM recipes ORDER BY ranking DESC, name ASC LIMIT ? OFFSET ?`,
    )
    .all(limit, offset) as RecipeRow[];

  return { data: rows.map(toRecipe), total, limit, offset };
}

export function getRecipe(id: number): Recipe | null {
  const row = getDb().prepare('SELECT * FROM recipes WHERE id = ?').get(id) as RecipeRow | undefined;
  return row ? toRecipe(row) : null;
}

export interface NewRecipe {
  name: string;
  category: string;
  author: string;
  ingredients: string[];
  instructions: string;
  rating: number;
  ranking: number;
  imageUrl: string | null;
}

export function createRecipe(input: NewRecipe): Recipe {
  const info = getDb()
    .prepare(
      `INSERT INTO recipes (name, category, author, ingredients, instructions, rating, ranking, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.name,
      input.category,
      input.author,
      JSON.stringify(input.ingredients),
      input.instructions,
      input.rating,
      input.ranking,
      input.imageUrl,
    );

  const created = getRecipe(Number(info.lastInsertRowid));
  if (!created) throw new Error('Recipe insert failed');
  return created;
}

export function countRecipes(): number {
  const { total } = getDb().prepare('SELECT COUNT(*) AS total FROM recipes').get() as { total: number };
  return total;
}
