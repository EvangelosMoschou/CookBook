import type { Recipe } from './types';
import { RECIPE_NAMES, RECIPE_CATEGORIES, RECIPE_AUTHORS } from './constants';

// ─── Seeded Pseudo-Random ─────────────────────────────────────────────────────
//
// Using a deterministic formula instead of Math.random() keeps the generated
// recipe list stable across re-renders without needing a memoization wrapper.

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10_000;
  return x - Math.floor(x);
}

// ─── Recipe Generation ────────────────────────────────────────────────────────

/**
 * Generates a stable, sorted list of mock Recipe objects.
 * Pure function — safe to call inside useMemo or at module level.
 */
export function generateRecipes(count: number): Recipe[] {
  const limit = Math.min(count, 100); // hard cap at 100 as per Gherkin
  const recipes: Recipe[] = [];

  for (let i = 0; i < limit; i++) {
    recipes.push({
      id: i + 1,
      name: RECIPE_NAMES[i],
      ranking: Math.floor(seededRand(i * 3) * 20) + 80,   // 80–100
      author: RECIPE_AUTHORS[Math.floor(seededRand(i * 7) * RECIPE_AUTHORS.length)],
      category: RECIPE_CATEGORIES[Math.floor(seededRand(i * 11) * RECIPE_CATEGORIES.length)],
      rating: parseFloat((seededRand(i * 13) * 2 + 3).toFixed(1)), // 3.0–5.0
    });
  }

  // Primary sort: ranking descending. Tie-break: name ascending.
  return recipes.sort((a, b) =>
    b.ranking !== a.ranking ? b.ranking - a.ranking : a.name.localeCompare(b.name),
  );
}
