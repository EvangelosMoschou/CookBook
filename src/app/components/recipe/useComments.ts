import { useState, useRef, useCallback } from 'react';
import type { Comment, CommentOutcome } from './types';
import { INITIAL_COMMENTS, BANNED_WORDS } from './constants';

// ─── Content Policy ───────────────────────────────────────────────────────────
//
// Importing BANNED_WORDS from constants keeps a single source of truth.
// The check function lives here (not in utils) so it shares the same module
// scope as submitComment, eliminating any stale-import risk.

function hasViolatingContent(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some(word => lower.includes(word));
}

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

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Encapsulates all comment state and business rules.
 *
 * Uses refs for commentText and hasBan so that submitComment (stabilised with
 * useCallback) always reads the CURRENT values — eliminating any stale-closure
 * risk that existed when those values were captured directly in the closure.
 */
export function useComments(hasBan: boolean): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [commentText, setCommentTextState] = useState('');
  const [outcome, setOutcome] = useState<CommentOutcome>(null);

  // ── Refs: always hold the latest values ──────────────────────────────────────
  const commentTextRef = useRef(commentText);
  const hasBanRef      = useRef(hasBan);

  // Keep refs in sync on every render, before any event handler fires.
  commentTextRef.current = commentText;
  hasBanRef.current      = hasBan;

  // ── Stable setter that keeps the ref in sync ──────────────────────────────────
  const setCommentText = useCallback((text: string) => {
    commentTextRef.current = text;
    setCommentTextState(text);
  }, []);

  // ── Core submit logic ─────────────────────────────────────────────────────────
  //
  // Empty dependency array is intentional: the function only reads from refs,
  // which are always up-to-date before any event handler fires.
  const submitComment = useCallback(() => {
    const text   = commentTextRef.current;
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

    // Happy path — post the comment (Scenario C-1)
    const newComment: Comment = {
      id: Date.now(),
      author: 'You',
      text,
      timestamp: 'Just now',
    };
    setComments(prev => [newComment, ...prev]);
    setCommentTextState('');
    commentTextRef.current = '';
    setOutcome({ type: 'success' });
  }, []); // stable — refs handle freshness

  const dismissOutcome = useCallback(() => {
    setOutcome(null);
    setCommentTextState('');
    commentTextRef.current = '';
  }, []);

  return { comments, commentText, setCommentText, outcome, submitComment, dismissOutcome };
}
