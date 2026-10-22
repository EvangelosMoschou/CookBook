import { ChevronRight, Star, ListX } from '../icons';
import { VerifiedBadge } from '../VerifiedBadge';
import { COLORS, FONTS } from './constants';
import type { Recipe } from './types';

// ─── Header ───────────────────────────────────────────────────────────────────

function ScreenHeader({ onBack }: { onBack: () => void }) {
  return (
    <div
      style={{
        height: '56px',
        backgroundColor: COLORS.secondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: COLORS.white,
          fontFamily: FONTS.body,
          fontSize: '14px',
          cursor: 'pointer',
          padding: '8px 0',
        }}
      >
        ← Back
      </button>
      <h1
        style={{
          fontFamily: FONTS.heading,
          fontSize: '20px',
          fontWeight: '600',
          color: COLORS.white,
          margin: 0,
        }}
      >
        Top Recipes
      </h1>
      <VerifiedBadge />
    </div>
  );
}

// ─── Load Banner ──────────────────────────────────────────────────────────────
// Colour varies: green for "all loaded", orange for capped, red for empty.

function LoadBanner({ message, isEmpty, isCapped }: { message: string; isEmpty: boolean; isCapped: boolean }) {
  const bg     = isEmpty ? '#FEF0EF' : isCapped ? '#FFF3E0' : '#F0F8F0';
  const border = isEmpty ? '#C84538'  : isCapped ? '#E8762F' : '#5A8F56';
  const icon   = isEmpty ? '✕'        : isCapped ? '⚠'       : '✓';
  const color  = isEmpty ? '#C84538'  : isCapped ? '#9A4E0A' : COLORS.secondary;

  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '16px 16px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '18px', color: border, fontWeight: '700', lineHeight: 1 }}>
        {icon}
      </span>
      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: '14px',
          fontWeight: '600',
          color,
          margin: 0,
        }}
      >
        {message}
      </p>
    </div>
  );
}

// ─── Recipe Row ──────────────────────────────────────────────────────────────

function RecipeRow({
  recipe,
  rank,
  onSelect,
}: {
  recipe: Recipe;
  rank: number;
  onSelect: (recipe: Recipe) => void;
}) {
  const isTopThree = rank <= 3;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(recipe)}
      onKeyDown={e => e.key === 'Enter' && onSelect(recipe)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
      style={{
        backgroundColor: COLORS.white,
        border: `1px solid ${COLORS.borderLight}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        outline: 'none',
      }}
    >
      {/* Rank badge */}
      <div
        style={{
          minWidth: '40px',
          height: '40px',
          backgroundColor: isTopThree ? COLORS.accent : 'rgba(45,62,44,0.1)',
          color: isTopThree ? COLORS.white : COLORS.secondary,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.body,
          fontSize: '16px',
          fontWeight: '700',
        }}
      >
        {rank}
      </div>

      {/* Recipe info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontFamily: FONTS.body,
            fontSize: '16px',
            fontWeight: '600',
            color: COLORS.text,
            margin: '0 0 4px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {recipe.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Star size={14} fill={COLORS.accent} color={COLORS.accent} />
          <span
            style={{
              fontFamily: FONTS.body,
              fontSize: '13px',
              fontWeight: '600',
              color: COLORS.text,
            }}
          >
            {recipe.rating}
          </span>
          <span style={{ fontFamily: FONTS.body, fontSize: '12px', color: COLORS.textMuted }}>
            • {recipe.category}
          </span>
        </div>

        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: '12px',
            color: COLORS.accent,
            backgroundColor: 'rgba(232,118,47,0.1)',
            padding: '2px 8px',
            borderRadius: '8px',
            fontWeight: '600',
          }}
        >
          Score: {recipe.ranking}/100
        </span>
      </div>

      <ChevronRight size={24} color={COLORS.textMuted} />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 32px 24px',
        gap: '0',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#FEECEC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <ListX size={38} color="#C84538" />
      </div>

      {/* Title */}
      <h2
        style={{
          fontFamily: FONTS.heading,
          fontSize: '20px',
          fontWeight: '700',
          color: '#C84538',
          textAlign: 'center',
          margin: '0 0 10px 0',
        }}
      >
        No Recipes Available
      </h2>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: '14px',
          color: COLORS.textMuted,
          textAlign: 'center',
          lineHeight: '1.6',
          margin: '0 0 36px 0',
        }}
      >
        There are currently no recipes in the system to display.
        Check back later or add new recipes to the platform.
      </p>

      {/* Exit — the ONLY choice offered when there are no recipes */}
      <button
        onClick={onBack}
        style={{
          width: '100%',
          height: '52px',
          backgroundColor: COLORS.secondary,
          borderRadius: '12px',
          fontFamily: FONTS.body,
          fontSize: '15px',
          fontWeight: '600',
          color: COLORS.white,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Exit Interface
      </button>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface RecipeListViewProps {
  recipes: Recipe[];
  loadMessage: string;
  isEmpty: boolean;
  isCapped: boolean;
  onSelectRecipe: (recipe: Recipe) => void;
  onBack: () => void;
  desktop?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders the ranked recipe list screen.
 *
 * Two distinct layouts:
 *   • isEmpty = true  → empty-state illustration + exit-only
 *   • isEmpty = false → scrollable ranked list + exit button at bottom
 *
 * The `rank` value is derived from array index so sorting is the only
 * source of truth.
 */
export function RecipeListView({
  recipes,
  loadMessage,
  isEmpty,
  isCapped,
  onSelectRecipe,
  onBack,
  desktop,
}: RecipeListViewProps) {
  return (
    <div
      style={{
        ...(desktop ? { width: '100%', minHeight: '100%' } : { width: '393px', height: '852px', overflow: 'hidden' }),
        backgroundColor: COLORS.primary,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!desktop && <ScreenHeader onBack={onBack} />}

      {/* Always show the Gherkin message as a banner */}
      <LoadBanner message={loadMessage} isEmpty={isEmpty} isCapped={isCapped} />

      {isEmpty ? (
        /* ── Empty state ── no list, only exit */
        <EmptyState onBack={onBack} />
      ) : (
        /* ── Non-empty: scrollable list + exit button ── */
        <>
          {/* Recipe count sub-label */}
          <div
            style={{
              padding: '10px 16px 4px',
              flexShrink: 0,
            }}
          >
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: '12px',
                color: COLORS.textMuted,
                margin: 0,
              }}
            >
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} · ranked highest to lowest · alphabetical on ties
            </p>
          </div>

          {/* Scrollable list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 4px' }}>
            {recipes.map((recipe, index) => (
              <RecipeRow
                key={recipe.id}
                recipe={recipe}
                rank={index + 1}
                onSelect={onSelectRecipe}
              />
            ))}
          </div>

          {/* Exit interface — explicitly offered as per Gherkin */}
          <div
            style={{
              padding: '12px 16px 16px',
              backgroundColor: COLORS.white,
              borderTop: `1px solid ${COLORS.border}`,
              flexShrink: 0,
            }}
          >
            <button
              onClick={onBack}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: 'transparent',
                border: `2px solid ${COLORS.secondary}`,
                borderRadius: '12px',
                fontFamily: FONTS.body,
                fontSize: '15px',
                fontWeight: '500',
                color: COLORS.secondary,
                cursor: 'pointer',
              }}
            >
              Exit Interface
            </button>
          </div>
        </>
      )}
    </div>
  );
}