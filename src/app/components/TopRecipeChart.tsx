/**
 * TopRecipeChart — public entry point.
 *
 * Gherkin scenarios (Feature: Top recipe chart):
 *   ① recipesCount = 25      → display 25,  loadMessage = "All recipes loaded!"
 *   ② recipesCount = 100     → display 100, loadMessage = "All recipes loaded!"
 *   ③ recipesCount = 500135  → display 100, loadMessage = "100 recipes loaded!"
 *   ④ recipesCount = 0       → empty state, loadMessage = "There are no recipes on the system!"
 *
 * Dependency graph (no circular imports):
 *   TopRecipeChart
 *     ├── RecipeListView   (display only)
 *     └── RecipeDetailView (display only)
 *           └── CommentSection (display + interaction)
 *                 └── useComments (state + business rules)
 *                       └── constants / types
 */

import { useMemo, useState } from 'react';
import { generateRecipes } from './recipe/utils';
import { RecipeListView } from './recipe/RecipeListView';
import { RecipeDetailView } from './recipe/RecipeDetailView';
import type { Recipe, TopRecipeChartProps } from './recipe/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_DISPLAY = 100;

// ─── Load-message logic (matches Gherkin exactly) ────────────────────────────

function deriveLoadMessage(recipesCount: number): string {
  if (recipesCount === 0)         return 'There are no recipes on the system!';
  if (recipesCount > MAX_DISPLAY) return '100 recipes loaded!';
  return 'All recipes loaded!';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TopRecipeChart({
  hasBan,
  recipesCount = 100,
  onBack,
  desktop,
}: TopRecipeChartProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  /**
   * generateRecipes already hard-caps at 100 internally; we also pass the
   * capped value so useMemo only re-runs when the effective count changes.
   */
  const displayCount = Math.min(recipesCount, MAX_DISPLAY);
  const recipes      = useMemo(() => generateRecipes(displayCount), [displayCount]);
  const loadMessage  = deriveLoadMessage(recipesCount);

  // isCapped is true only when the original count exceeded the display limit.
  // Derived here from the source value so RecipeListView never has to inspect
  // a message string to determine visual state.
  const isCapped = recipesCount > MAX_DISPLAY;

  if (selectedRecipe) {
    const recipeRank = recipes.findIndex(r => r.id === selectedRecipe.id) + 1;
    return (
      <RecipeDetailView
        recipe={selectedRecipe}
        recipeRank={recipeRank}
        hasBan={hasBan}
        onBack={() => setSelectedRecipe(null)}
      />
    );
  }

  return (
    <RecipeListView
      recipes={recipes}
      loadMessage={loadMessage}
      isEmpty={recipesCount === 0}
      isCapped={isCapped}
      onSelectRecipe={setSelectedRecipe}
      onBack={onBack ?? (() => {})}
      desktop={desktop}
    />
  );
}
