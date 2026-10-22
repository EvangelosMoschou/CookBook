import type React from 'react';
import { COLORS, FONTS } from './constants';
import { useComments } from './useComments';
import type { Comment, CommentOutcome } from './types';

// ─── Outcome Config Table ─────────────────────────────────────────────────────
//
// All outcome-specific copy and colours live here.  Adding a new outcome type
// only requires adding a row to this table — no if/else chains to update.

interface OutcomeDisplay {
  bg: string;
  borderColor: string;
  textColor: string;
  message: string;
  /** Primary (accent) action label, or null when there is only one action. */
  primaryLabel: string | null;
  secondaryLabel: string;
  /** When true the secondary button calls onExit instead of onDismiss. */
  secondaryIsExit: boolean;
}

const OUTCOME_DISPLAY: Record<NonNullable<CommentOutcome>['type'], OutcomeDisplay> = {
  success: {
    bg: '#E8F5E9',
    borderColor: '#4CAF50',
    textColor: '#2E7D32',
    message: 'Comment posted successfully!',
    primaryLabel: 'Continue Commenting',
    secondaryLabel: 'Exit',
    secondaryIsExit: true,
  },
  banned: {
    bg: '#FFEBEE',
    borderColor: '#F44336',
    textColor: '#C62828',
    message: 'Comment posting not available - Banned account!',
    primaryLabel: null,
    secondaryLabel: 'Exit Comment Posting',
    secondaryIsExit: true,
  },
  violation: {
    bg: '#FFEBEE',
    borderColor: '#F44336',
    textColor: '#C62828',
    message: 'Comment not posted - Rules violation!',
    primaryLabel: 'Edit Comment',
    secondaryLabel: 'Exit',
    secondaryIsExit: true,
  },
  empty: {
    bg: '#FFF3E0',
    borderColor: '#FF9800',
    textColor: '#E65100',
    message: 'Please enter a comment before posting.',
    primaryLabel: null,
    secondaryLabel: 'Dismiss',
    secondaryIsExit: false,
  },
  error: {
    bg: '#FEF2F2',
    borderColor: '#F87171',
    textColor: '#B91C1C',
    message: 'Could not post your comment — please try again.',
    primaryLabel: null,
    secondaryLabel: 'Dismiss',
    secondaryIsExit: false,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Renders the feedback banner after a submit attempt. */
function CommentFeedback({
  outcome,
  onDismiss,
  onExit,
}: {
  outcome: NonNullable<CommentOutcome>;
  onDismiss: () => void;
  onExit: () => void;
}) {
  const cfg = OUTCOME_DISPLAY[outcome.type];

  return (
    <div
      style={{
        marginBottom: '16px',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: cfg.bg,
        border: `2px solid ${cfg.borderColor}`,
      }}
    >
      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: '14px',
          fontWeight: '600',
          color: cfg.textColor,
          margin: 0,
          marginBottom: cfg.primaryLabel || cfg.secondaryLabel ? '12px' : 0,
        }}
      >
        {cfg.message}
      </p>

      <div style={{ display: 'flex', gap: '8px' }}>
        {cfg.primaryLabel && (
          <button onClick={onDismiss} style={accentButtonStyle}>
            {cfg.primaryLabel}
          </button>
        )}
        <button
          onClick={cfg.secondaryIsExit ? onExit : onDismiss}
          style={cfg.primaryLabel ? outlineButtonStyle : fullWidthDarkButtonStyle}
        >
          {cfg.secondaryLabel}
        </button>
      </div>
    </div>
  );
}

/** Renders a single comment card. */
function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '12px',
        backgroundColor: COLORS.white,
        border: `2px solid ${COLORS.border}`,
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.secondary,
          }}
        >
          {comment.author}
        </span>
        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: '12px',
            color: COLORS.textMuted,
          }}
        >
          {comment.timestamp}
        </span>
      </div>
      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: '14px',
          color: '#4A4A4A',
          lineHeight: '1.5',
          margin: 0,
        }}
      >
        {comment.text}
      </p>
    </div>
  );
}

// ─── Shared Button Styles ─────────────────────────────────────────────────────

const baseButtonStyle: React.CSSProperties = {
  height: '40px',
  fontFamily: FONTS.body,
  fontSize: '13px',
  fontWeight: '600',
  borderRadius: '8px',
  cursor: 'pointer',
  border: `2px solid ${COLORS.secondary}`,
};

const accentButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  flex: 1,
  backgroundColor: COLORS.accent,
  color: COLORS.white,
};

const outlineButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  flex: 1,
  backgroundColor: COLORS.white,
  color: COLORS.secondary,
};

const fullWidthDarkButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  width: '100%',
  backgroundColor: COLORS.secondary,
  color: COLORS.white,
};

// ─── Main Export ──────────────��───────────────────────────────────────────────

interface CommentSectionProps {
  hasBan: boolean;
  /** Called when the user presses any "Cancel" button in the feedback banner. */
  onExit: () => void;
  /** Recipe the comments belong to. Enables persistence in api mode. */
  recipeId?: number;
  /** Set when this recipe exists in the backend (i.e. came from the API). */
  persistToApi?: boolean;
}

/**
 * Self-contained comment section.
 *
 * Owns its own state via `useComments`, keeping parent components free from
 * comment-specific logic (SRP / Dependency Inversion via the hook).
 */
export function CommentSection({ hasBan, onExit, recipeId, persistToApi }: CommentSectionProps) {
  const { comments, commentText, setCommentText, outcome, submitComment, dismissOutcome } =
    useComments(hasBan, { recipeId, persist: persistToApi });

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Section heading */}
      <h3
        style={{
          fontFamily: FONTS.heading,
          fontSize: '20px',
          fontWeight: '700',
          color: COLORS.secondary,
          marginBottom: '12px',
        }}
      >
        Comments ({comments.length})
      </h3>

      {/* Input area */}
      <div
        style={{
          backgroundColor: COLORS.white,
          border: `2px solid ${COLORS.border}`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <textarea
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="Share your thoughts about this recipe..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '12px',
            fontFamily: FONTS.body,
            fontSize: '14px',
            color: COLORS.secondary,
            backgroundColor: COLORS.primary,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '8px',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={submitComment}
          style={{
            marginTop: '12px',
            width: '100%',
            height: '44px',
            backgroundColor: COLORS.accent,
            color: COLORS.white,
            fontFamily: FONTS.body,
            fontSize: '14px',
            fontWeight: '600',
            border: `2px solid ${COLORS.secondary}`,
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Post Comment
        </button>
      </div>

      {/* Outcome feedback banner */}
      {outcome && <CommentFeedback outcome={outcome} onDismiss={dismissOutcome} onExit={onExit} />}

      {/* Comment list */}
      <div style={{ marginBottom: '20px' }}>
        {comments.map(comment => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}