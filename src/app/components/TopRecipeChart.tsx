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

import { useEffect, useMemo, useState } from 'react';
import { generateRecipes } from './recipe/utils';
import { RecipeListView } from './recipe/RecipeListView';
import { RecipeDetailView } from './recipe/RecipeDetailView';
import type { Recipe, TopRecipeChartProps } from './recipe/types';
import { isApiMode } from '../data/config';
import { listRecipes } from '../data/repositories';

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
  showExitBar,
}: TopRecipeChartProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  /**
   * generateRecipes already hard-caps at 100 internally; we also pass the
   * capped value so useMemo only re-runs when the effective count changes.
   */
  const displayCount = Math.min(recipesCount, MAX_DISPLAY);
  const mockRecipes = useMemo(() => generateRecipes(displayCount), [displayCount]);

  // ── api mode: the backend is the source of truth ──────────────────────────
  const [apiRecipes, setApiRecipes] = useState<Recipe[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isApiMode);

  useEffect(() => {
    if (!isApiMode) return;

    let cancelled = false;
    setLoading(true);

    listRecipes(MAX_DISPLAY)
      .then((page) => {
        if (cancelled) return;
        setApiRecipes(
          page.data.map((recipe) => ({
            id: recipe.id,
            name: recipe.name,
            ranking: recipe.ranking,
            author: recipe.author,
            category: recipe.category,
            rating: recipe.rating,
          })),
        );
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Could not load recipes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const recipes = isApiMode ? apiRecipes : mockRecipes;
  const isEmpty = isApiMode ? !loading && recipes.length === 0 : recipesCount === 0;
  const isCapped = !isApiMode && recipesCount > MAX_DISPLAY;

  const loadMessage = isApiMode
    ? loading
      ? 'Loading recipes…'
      : (loadError ??
        (recipes.length === 0
          ? 'There are no recipes on the system!'
          : `${recipes.length} recipes loaded!`))
    : deriveLoadMessage(recipesCount);

  if (selectedRecipe) {
    const recipeRank = recipes.findIndex(r => r.id === selectedRecipe.id) + 1;
    return (
      <RecipeDetailView
        recipe={selectedRecipe}
        recipeRank={recipeRank}
        hasBan={hasBan}
        onBack={() => setSelectedRecipe(null)}
        desktop={desktop}
      />
    );
  }

  return (
    <RecipeListView
      recipes={recipes}
      loadMessage={loadMessage}
      isEmpty={isEmpty}
      isCapped={isCapped}
      onSelectRecipe={setSelectedRecipe}
      onBack={onBack ?? (() => {})}
      desktop={desktop}
      showExitBar={showExitBar}
    />
  );
}
