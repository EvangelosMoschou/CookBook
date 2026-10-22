// ─── Domain Types ────────────────────────────────────────────────────────────

export interface Recipe {
  id: number;
  name: string;
  /** Score out of 100 used for chart ranking */
  ranking: number;
  author: string;
  category: string;
  rating: number;
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
}

// ─── Comment Outcome ──────────────────────────────────────────────────────────
//
// A discriminated union replaces the previous approach of matching on raw
// message strings (e.g. `message.includes('Banned')`), making all outcome
// handling exhaustive and refactor-safe.

export type CommentOutcome =
  | { type: 'success' }
  | { type: 'banned' }
  | { type: 'violation' }
  | { type: 'empty' }
  | { type: 'error' }
  | null;

// ─── Component Props ──────────────────────────────────────────────────────────

export interface TopRecipeChartProps {
  hasBan: boolean;
  recipesCount?: number;
  onBack?: () => void;
  desktop?: boolean;
  showExitBar?: boolean;
}