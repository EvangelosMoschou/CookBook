import { Star } from '../icons';
import { VerifiedBadge } from '../VerifiedBadge';
import { CommentSection } from './CommentSection';
import { COLORS, FONTS } from './constants';
import type { Recipe } from './types';

// ─── Header ───────────────────────────────────────────────────────────────────

function ScreenHeader({
  title,
  backLabel,
  onBack,
}: {
  title: string;
  backLabel: string;
  onBack: () => void;
}) {
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
        {backLabel}
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
        {title}
      </h1>
      <VerifiedBadge />
    </div>
  );
}

// ─── Chip / Tag ───────────────────────────────────────────────────────────────

function MetaChip({
  label,
  variant = 'default',
}: {
  label: string;
  variant?: 'default' | 'accent';
}) {
  const isAccent = variant === 'accent';
  return (
    <span
      style={{
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: isAccent ? COLORS.accent : COLORS.secondary,
        backgroundColor: isAccent ? 'rgba(232,118,47,0.1)' : 'rgba(45,62,44,0.1)',
        padding: '6px 12px',
        borderRadius: '12px',
      }}
    >
      {label}
    </span>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: FONTS.body,
        fontSize: '16px',
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: '8px',
      }}
    >
      {children}
    </h3>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RecipeDetailViewProps {
  recipe: Recipe;
  /** 1-based position in the ranked list */
  recipeRank: number;
  hasBan: boolean;
  onBack: () => void;
  /** When true, fills the desktop canvas instead of the 393px phone frame. */
  desktop?: boolean;
}

// ─── Static key ingredients (mock placeholder data) ──────────────────────────

const KEY_INGREDIENTS = [
  'Main ingredient',
  'Secondary ingredient',
  'Spices and seasonings',
  'Optional garnish',
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders the full recipe detail screen including the comments section.
 *
 * It delegates comment behaviour entirely to `CommentSection`, keeping this
 * component focused on recipe content presentation (SRP).
 */
export function RecipeDetailView({
  recipe,
  recipeRank,
  hasBan,
  onBack,
  desktop,
}: RecipeDetailViewProps) {
  return (
    <div
      style={{
        ...(desktop ? { width: '100%', minHeight: '100%' } : { width: '100%', height: '100%' }),
        backgroundColor: COLORS.primary,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <ScreenHeader title="Recipe Details" backLabel="← Back to List" onBack={onBack} />

      {/* Scrollable body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: desktop ? '32px 24px' : '20px 16px',
          width: '100%',
          maxWidth: desktop ? '760px' : undefined,
          margin: desktop ? '0 auto' : undefined,
        }}
      >
        {/* Rank badge */}
        <div
          style={{
            display: 'inline-block',
            backgroundColor: COLORS.accent,
            color: COLORS.white,
            fontFamily: FONTS.body,
            fontSize: '14px',
            fontWeight: '700',
            padding: '8px 16px',
            borderRadius: '20px',
            marginBottom: '16px',
          }}
        >
          #{recipeRank} Top Recipe
        </div>

        {/* Hero image placeholder */}
        <div
          style={{
            width: '100%',
            height: '200px',
            backgroundColor: '#E0E0E0',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
          }}
        >
          🍽️
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: FONTS.heading,
            fontSize: '28px',
            fontWeight: '700',
            color: COLORS.secondary,
            marginBottom: '12px',
          }}
        >
          {recipe.name}
        </h2>

        {/* Rating row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Star size={20} fill={COLORS.accent} color={COLORS.accent} />
          <span
            style={{
              fontFamily: FONTS.body,
              fontSize: '18px',
              fontWeight: '700',
              color: COLORS.text,
            }}
          >
            {recipe.rating}
          </span>
          <span style={{ fontFamily: FONTS.body, fontSize: '14px', color: COLORS.textMuted }}>
            / 5.0 (127 reviews)
          </span>
        </div>

        {/* Meta chips */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <MetaChip label={recipe.category} />
          <MetaChip label={`By ${recipe.author}`} />
          <MetaChip label={`Ranking: ${recipe.ranking}/100`} variant="accent" />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <SectionHeading>Description</SectionHeading>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: '14px',
              color: COLORS.text,
              lineHeight: '1.6',
            }}
          >
            This delicious {recipe.name} recipe has earned a top ranking in our community. Perfect
            for any occasion, it has been tried and tested by home cooks worldwide.
          </p>
        </div>

        {/* Key Ingredients */}
        <div style={{ marginBottom: '20px' }}>
          <SectionHeading>Key Ingredients</SectionHeading>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {KEY_INGREDIENTS.map(item => (
              <li
                key={item}
                style={{
                  fontFamily: FONTS.body,
                  fontSize: '14px',
                  color: COLORS.text,
                  lineHeight: '1.8',
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Cooking Instructions */}
        <div style={{ marginBottom: '20px' }}>
          <SectionHeading>Cooking Instructions</SectionHeading>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: '14px',
              color: COLORS.text,
              lineHeight: '1.6',
            }}
          >
            Detailed step-by-step instructions for preparing this amazing recipe would be displayed
            here.
          </p>
        </div>

        {/* Comments — fully self-contained */}
        <CommentSection hasBan={hasBan} onExit={onBack} recipeId={recipe.id} persistToApi />
      </div>
    </div>
  );
}