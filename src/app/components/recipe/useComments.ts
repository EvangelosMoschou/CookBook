import { useState, useRef, useCallback, useEffect } from 'react';
import type { Comment, CommentOutcome } from './types';
import { INITIAL_COMMENTS, BANNED_WORDS } from './constants';
import { isApiMode } from '../../data/config';
import { ApiError } from '../../data/client';
import { createComment, listComments, type CommentDto } from '../../data/repositories';

// ─── Content Policy ───────────────────────────────────────────────────────────
//
// Word-bounded matching: "shellfish" must not trip the "hell" rule.

const BANNED_PATTERN = new RegExp(`\\b(?:${BANNED_WORDS.join('|')})\\b`, 'i');

function hasViolatingContent(text: string): boolean {
  return BANNED_PATTERN.test(text);
}

// ─── API mapping ──────────────────────────────────────────────────────────────

/** SQLite stores UTC as "YYYY-MM-DD HH:MM:SS"; render it in local time. */
function formatTimestamp(value: string): string {
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

const toComment = (dto: CommentDto): Comment => ({
  id: dto.id,
  author: dto.author,
  text: dto.text,
  timestamp: formatTimestamp(dto.createdAt),
});

// ─── Return Type ──────────────────────────────────────────────────────────────

export interface UseCommentsReturn {
  comments: Comment[];
  commentText: string;
  setCommentText: (text: string) => void;
  /** Current outcome of the last submit attempt, or null if idle. */
  outcome: CommentOutcome;
  submitComment: () => void;
  /** Clears the outcome banner and resets the input. */
  dismissOutcome: () => void;
}

export interface UseCommentsOptions {
  /** Recipe the comments belong to. Required for persistence. */
  recipeId?: number;
  /** When true (and the app runs in api mode) comments round-trip to the API. */
  persist?: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Encapsulates all comment state and business rules.
 *
 * Two sources of truth:
 *   • mock mode — in-browser state, seeded from INITIAL_COMMENTS
 *   • api mode  — comments are loaded from and posted to the backend
 *
 * Refs keep `submitComment` stable while always reading current values.
 */
export function useComments(
  hasBan: boolean,
  { recipeId, persist: persistRequested = false }: UseCommentsOptions = {},
): UseCommentsReturn {
  const persist = persistRequested && isApiMode && recipeId != null;

  const [comments, setComments] = useState<Comment[]>(persist ? [] : INITIAL_COMMENTS);
  const [commentText, setCommentTextState] = useState('');
  const [outcome, setOutcome] = useState<CommentOutcome>(null);

  // ── Refs: always hold the latest values ──────────────────────────────────────
  const commentTextRef = useRef(commentText);
  const hasBanRef = useRef(hasBan);
  const persistRef = useRef(persist);
  const recipeIdRef = useRef(recipeId);

  commentTextRef.current = commentText;
  hasBanRef.current = hasBan;
  persistRef.current = persist;
  recipeIdRef.current = recipeId;

  // ── Load existing comments for the recipe ───────────────────────────────────
  useEffect(() => {
    if (!persist || recipeId == null) return;

    let cancelled = false;
    listComments(recipeId)
      .then(({ data }) => {
        if (!cancelled) setComments(data.map(toComment));
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      });

    return () => {
      cancelled = true;
    };
  }, [persist, recipeId]);

  // ── Stable setter that keeps the ref in sync ────────────────────────────────
  const setCommentText = useCallback((text: string) => {
    commentTextRef.current = text;
    setCommentTextState(text);
  }, []);

  const clearInput = useCallback(() => {
    setCommentTextState('');
    commentTextRef.current = '';
  }, []);

  // ── Core submit logic ───────────────────────────────────────────────────────
  const submitComment = useCallback(() => {
    const text = commentTextRef.current;
    const banned = hasBanRef.current;

    // Guard 1 — empty input
    if (!text.trim()) {
      setOutcome({ type: 'empty' });
      return;
    }

    // Guard 2 — banned account (Scenario C-2)
    if (banned) {
      setOutcome({ type: 'banned' });
      return;
    }

    // Guard 3 — policy violation (Scenario C-3)
    if (hasViolatingContent(text)) {
      setOutcome({ type: 'violation' });
      return;
    }

    // Happy path — persist when the API is the source of truth
    if (persistRef.current && recipeIdRef.current != null) {
      const targetId = recipeIdRef.current;

      createComment(targetId, text)
        .then((created) => {
          setComments((prev) => [toComment(created), ...prev]);
          clearInput();
          setOutcome({ type: 'success' });
        })
        .catch((error: unknown) => {
          if (error instanceof ApiError && error.status === 403) setOutcome({ type: 'banned' });
          else if (error instanceof ApiError && error.status === 422) setOutcome({ type: 'violation' });
          else setOutcome({ type: 'error' });
        });
      return;
    }

    // Happy path — local state (Scenario C-1)
    const newComment: Comment = {
      id: Date.now(),
      author: 'You',
      text,
      timestamp: 'Just now',
    };
    setComments((prev) => [newComment, ...prev]);
    clearInput();
    setOutcome({ type: 'success' });
  }, [clearInput]); // stable — refs handle freshness

  const dismissOutcome = useCallback(() => {
    setOutcome(null);
    setCommentTextState('');
    commentTextRef.current = '';
  }, []);

  return { comments, commentText, setCommentText, outcome, submitComment, dismissOutcome };
}
