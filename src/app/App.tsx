import { lazy, Suspense, useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { useApiHealth } from './data/useApiHealth';
import { PHONE_BREAKPOINT, useViewport } from './hooks/useViewport';

const JobListingForm = lazy(() =>
  import('./components/JobListingForm').then((m) => ({ default: m.JobListingForm })),
);
const RecipeSuggestionsForm = lazy(() =>
  import('./components/RecipeSuggestionsForm').then((m) => ({
    default: m.RecipeSuggestionsForm,
  })),
);
const TopRecipeChart = lazy(() =>
  import('./components/TopRecipeChart').then((m) => ({ default: m.TopRecipeChart })),
);

// ─── Job Listing Scenario Types ───────────────────────────────────────────────
type JobScenarioId = 1 | 2 | 3 | 4 | 5 | 6;

interface JobScenarioConfig {
  verificationStatus: 'Verified' | 'Unverified' | 'Pending';
  hasBan: boolean;
  description: string;
}

const JOB_SCENARIO_CONFIGS: Record<JobScenarioId, JobScenarioConfig> = {
  1: { verificationStatus: 'Verified',   hasBan: false, description: 'Verified · No ban — submission will post successfully' },
  2: { verificationStatus: 'Verified',   hasBan: false, description: 'Verified · No ban — leave required fields empty to trigger draft' },
  3: { verificationStatus: 'Unverified', hasBan: false, description: 'Unverified · No ban → "Account verification required to post jobs!"' },
  4: { verificationStatus: 'Verified',   hasBan: true,  description: 'Verified · Active ban → "Access denied: Your account has an active ban!"' },
  5: { verificationStatus: 'Pending',    hasBan: false, description: 'Pending · No ban → "Your verification is currently under review!"' },
  6: { verificationStatus: 'Unverified', hasBan: true,  description: 'Unverified · Active ban → "Account must be verified and penalty-free!"' },
};

const JOB_SCENARIO_RING: Record<JobScenarioId, string> = {
  1: '#4CAF50', 2: '#FF9800',
  3: '#F44336', 4: '#F44336', 5: '#F44336', 6: '#F44336',
};

const JOB_MAIN_SCENARIOS:    { id: JobScenarioId; label: string }[] = [
  { id: 1, label: 'Scenario 1 — Success' },
  { id: 2, label: 'Scenario 2 — Missing Info' },
];
const JOB_OUTLINE_SCENARIOS: { id: JobScenarioId; label: string }[] = [
  { id: 3, label: '3a · Unverified, No ban' },
  { id: 4, label: '3b · Verified, Active ban' },
  { id: 5, label: '3c · Pending, No ban' },
  { id: 6, label: '3d · Unverified + Active ban' },
];

// ─── Top Recipe Chart Scenario Types ─────────────────────────────────────────
type TopChartScenarioId = 1 | 2 | 3 | 4;

interface TopChartScenarioConfig {
  recipesCount: number;
  label: string;
  description: string;
  ring: string;
}

const TOP_CHART_SCENARIOS: Record<TopChartScenarioId, TopChartScenarioConfig> = {
  1: { recipesCount: 25,     label: 'TC-1 · 25 recipes',        description: '25 recipes in system → 25 shown · "All recipes loaded!"',              ring: '#4CAF50' },
  2: { recipesCount: 100,    label: 'TC-2 · 100 recipes',       description: '100 recipes in system → 100 shown · "All recipes loaded!"',             ring: '#4CAF50' },
  3: { recipesCount: 500135, label: 'TC-3 · 500135 recipes',    description: '500135 recipes in system → capped at 100 · "100 recipes loaded!"',     ring: '#FF9800' },
  4: { recipesCount: 0,      label: 'TC-4 · 0 recipes (empty)', description: '0 recipes in system → no list · "There are no recipes on the system!"', ring: '#F44336' },
};

// ─── Comment Scenario Types ───────────────────────────────────────────────────
type CommentScenarioId = 1 | 2 | 3;

interface CommentScenarioConfig {
  hasBan: boolean;
  label: string;
  description: string;
  ring: string;
}

const COMMENT_SCENARIOS: Record<CommentScenarioId, CommentScenarioConfig> = {
  1: { hasBan: false, label: 'C-1 · No ban · Success',    ring: '#4CAF50', description: 'No ban · Valid comment → "Comment posted successfully!"' },
  2: { hasBan: true,  label: 'C-2 · Active ban · Banned', ring: '#F44336', description: 'Active ban → "Comment posting not available - Banned account!"' },
  3: { hasBan: false, label: 'C-3 · No ban · Violation',  ring: '#FF9800', description: 'No ban · Type a swear word (e.g. "damn") → "Comment not posted - Rules violation!"' },
};

// ─── View types ───────────────────────────────────────────────────────────────
type ActiveView = 'home' | 'recipes' | 'chart' | 'job';

const VIEW_META: Record<ActiveView, { title: string; emoji: string; subtitle: string }> = {
  home:    { title: 'CookBook',           emoji: '📖', subtitle: 'Your culinary companion' },
  recipes: { title: 'Recipe Suggestions', emoji: '🔍', subtitle: 'Find your perfect recipe' },
  chart:   { title: 'Top Recipe Chart',   emoji: '📊', subtitle: 'The most loved recipes' },
  job:     { title: 'Post a Job Listing', emoji: '💼', subtitle: 'Find your next culinary talent' },
};

// ─── Desktop Home ─────────────────────────────────────────────────────────────
function DesktopHome({
  onRecipeSuggestions,
  onTopRecipeChart,
  onPostJob,
}: {
  onRecipeSuggestions: () => void;
  onTopRecipeChart: () => void;
  onPostJob: () => void;
}) {
  const cards = [
    {
      emoji: '🔍', title: 'Recipe Suggestions', subtitle: 'Find Your Perfect Recipe',
      desc: 'Enter ingredients you have on hand and available cooking time. Our system matches compatible recipes from our database.',
      tags: ['Ingredient-based', 'Time-filtered', 'Instant results'],
      color: '#E8762F', action: onRecipeSuggestions,
    },
    {
      emoji: '📊', title: 'Top Recipe Chart', subtitle: 'Most Loved Recipes',
      desc: 'Explore our ranked leaderboard of top-rated recipes. View details, read reviews, and leave comments on your favourites.',
      tags: ['Ranked by score', 'Comment system', 'Multiple scenarios'],
      color: '#5A8F56', action: onTopRecipeChart,
    },
    {
      emoji: '💼', title: 'Post a Job Listing', subtitle: 'Find Culinary Talent',
      desc: 'Create and publish job listings for chefs and culinary professionals. Includes account verification and ban-check safeguards.',
      tags: ['Verified accounts', 'Ban detection', 'Draft saving'],
      color: '#2D3E2C', action: onPostJob,
    },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '48px 40px' }}>
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '40px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 12px 0', lineHeight: 1.1 }}>
          Welcome to <span style={{ color: '#E8762F' }}>CookBook</span>
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.5)', margin: 0, maxWidth: '520px', lineHeight: 1.6 }}>
          A Software Engineering I demo application. Use the cards below or the sidebar to navigate between features.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {cards.map(({ emoji, title, subtitle, desc, tags, color, action }) => (
          <div
            key={title}
            onClick={action}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${color}40`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
            }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px', padding: '28px', cursor: 'pointer',
              transition: 'all 0.2s ease', boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>
              {emoji}
            </div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px 0' }}>{title}</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '600', color, margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{subtitle}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 20px 0', lineHeight: 1.6 }}>{desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
              {tags.map(t => (
                <span key={t} style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color, backgroundColor: `${color}18`, border: `1px solid ${color}30`, borderRadius: '20px', padding: '3px 10px' }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '600', color }}>
              Open feature <span style={{ marginLeft: 'auto' }}>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Lazy-load fallback ───────────────────────────────────────────────────────
function ViewFallback() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a2419', color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
      Loading…
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [jobScenario,           setJobScenario]           = useState<JobScenarioId>(1);
  const [topChartScenario,      setTopChartScenario]      = useState<TopChartScenarioId>(1);
  const [commentScenario,       setCommentScenario]       = useState<CommentScenarioId>(1);
  const [menuOpen,              setMenuOpen]              = useState(false);
  const [showJobForm,           setShowJobForm]           = useState(false);
  const [showRecipeSuggestions, setShowRecipeSuggestions] = useState(false);
  const [showTopRecipeChart,    setShowTopRecipeChart]    = useState(false);
  const [desktopMode,           setDesktopMode]           = useState(true);

  const api = useApiHealth();
  const { width: viewportWidth, height: viewportHeight } = useViewport();
  const isPhone = viewportWidth < PHONE_BREAKPOINT;
  const effectiveDesktop = desktopMode && !isPhone;

  // The mobile preview renders a fixed 393×852 device; scale it down when the
  // window is smaller than the frame so it never overflows.
  const frameScale = Math.max(
    0.4,
    Math.min(
      1,
      (viewportWidth - 256 - 64) / (393 + 24),
      (viewportHeight - 60 - 48) / (852 + 24),
    ),
  );
  const apiDot =
    api.status === 'online' ? '#5A8F56'
      : api.status === 'checking' ? '#F4A236'
      : api.status === 'offline' ? '#C84538'
      : '#6B7269';
  const apiLabel =
    api.status === 'online' ? `API · online · ${api.counts?.recipes ?? 0} recipes`
      : api.status === 'checking' ? 'API · checking…'
      : api.status === 'offline' ? 'API · offline'
      : 'Demo data (mock)';

  const activeView: ActiveView = showJobForm ? 'job'
    : showRecipeSuggestions ? 'recipes'
    : showTopRecipeChart    ? 'chart'
    : 'home';
  const viewMeta = VIEW_META[activeView];

  const jobConfig      = JOB_SCENARIO_CONFIGS[jobScenario];
  const topChartConfig = TOP_CHART_SCENARIOS[topChartScenario];
  const commentConfig  = COMMENT_SCENARIOS[commentScenario];

  const vmRingColor = showRecipeSuggestions ? commentConfig.ring
    : showTopRecipeChart ? topChartConfig.ring
    : JOB_SCENARIO_RING[jobScenario];

  const statusLabel = showRecipeSuggestions
    ? `Comments · ${commentConfig.hasBan ? 'Banned' : 'No ban'}`
    : showTopRecipeChart ? `Top Chart · TC-${topChartScenario}`
    : `${jobConfig.verificationStatus}${jobConfig.hasBan ? ' · Banned' : ' · No ban'}`;

  const activeDescription = showRecipeSuggestions ? commentConfig.description
    : showTopRecipeChart ? topChartConfig.description
    : jobConfig.description;

  const selectJobScenario      = (s: JobScenarioId)      => { setJobScenario(s);      setMenuOpen(false); };
  const selectTopChartScenario = (s: TopChartScenarioId) => { setTopChartScenario(s); setMenuOpen(false); };
  const selectCommentScenario  = (s: CommentScenarioId)  => { setCommentScenario(s);  setMenuOpen(false); };

  const goHome    = () => { setShowJobForm(false); setShowRecipeSuggestions(false); setShowTopRecipeChart(false); };
  const goRecipes = () => { setShowJobForm(false); setShowRecipeSuggestions(true);  setShowTopRecipeChart(false); };
  const goChart   = () => { setShowJobForm(false); setShowRecipeSuggestions(false); setShowTopRecipeChart(true); };
  const goJob     = () => { setShowJobForm(true);  setShowRecipeSuggestions(false); setShowTopRecipeChart(false); };

  const navItems = [
    { view: 'home'    as ActiveView, label: 'Home',               short: 'Home',     emoji: '🏠', action: goHome    },
    { view: 'recipes' as ActiveView, label: 'Recipe Suggestions', short: 'Recipes',  emoji: '🔍', action: goRecipes },
    { view: 'chart'   as ActiveView, label: 'Top Recipe Chart',   short: 'Chart',    emoji: '📊', action: goChart   },
    { view: 'job'     as ActiveView, label: 'Post a Job',         short: 'Post Job', emoji: '💼', action: goJob     },
  ];

  // Shared scenario dropdown — rendered into mobile or desktop header
  const ScenarioDropdown = ({ anchor = 'below' }: { anchor?: 'below' | 'above' }) => (
    <div style={{
      position: 'absolute',
      ...(anchor === 'above' ? { bottom: '52px', right: 0 } : { top: 0, right: 0 }),
      width: '240px',
      maxWidth: 'calc(100vw - 24px)',
      padding: '12px',
      zIndex: 50,
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      border: '1px solid #e5e5e0',
      maxHeight: 'calc(100dvh - 120px)',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#6B7269', border: `2px solid ${vmRingColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: '700', color: '#FFFFFF', flexShrink: 0 }}>VM</div>
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '600', color: '#1F2420', margin: 0 }}>VM User</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#6B7269', margin: 0 }}>{statusLabel}</p>
        </div>
      </div>
      <div style={{ height: '1px', backgroundColor: '#E5E5E0', marginBottom: '10px' }} />
      {showRecipeSuggestions ? (
        <>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: '600', color: '#6B7269', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>💬 Comments — Gherkin Scenarios</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
            {([1, 2, 3] as CommentScenarioId[]).map(id => (
              <button key={id} onClick={() => selectCommentScenario(id)}
                style={{ width: '100%', padding: '4px 8px', textAlign: 'left', borderRadius: '4px', border: '1px solid', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '10px', backgroundColor: commentScenario === id ? (id === 1 ? '#f0fdf4' : id === 2 ? '#fef2f2' : '#fffbeb') : '#f9fafb', borderColor: commentScenario === id ? (id === 1 ? '#16a34a' : id === 2 ? '#dc2626' : '#d97706') : '#d1d5db', color: commentScenario === id ? (id === 1 ? '#15803d' : id === 2 ? '#b91c1c' : '#b45309') : '#374151' }}>
                {COMMENT_SCENARIOS[id].label}
              </button>
            ))}
          </div>
        </>
      ) : showTopRecipeChart ? (
        <>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: '600', color: '#6B7269', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📊 Top Chart — Gherkin Outline</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
            {([1, 2, 3, 4] as TopChartScenarioId[]).map(id => (
              <button key={id} onClick={() => selectTopChartScenario(id)}
                style={{ width: '100%', padding: '4px 8px', textAlign: 'left', borderRadius: '4px', border: '1px solid', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '10px', backgroundColor: topChartScenario === id ? (id <= 2 ? '#f0fdf4' : id === 3 ? '#fffbeb' : '#fef2f2') : '#f9fafb', borderColor: topChartScenario === id ? (id <= 2 ? '#16a34a' : id === 3 ? '#d97706' : '#dc2626') : '#d1d5db', color: topChartScenario === id ? (id <= 2 ? '#15803d' : id === 3 ? '#b45309' : '#b91c1c') : '#374151' }}>
                {TOP_CHART_SCENARIOS[id].label}
              </button>
            ))}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: '600', color: '#6B7269', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>💬 Comments — Gherkin Scenarios</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
            {([1, 2, 3] as CommentScenarioId[]).map(id => (
              <button key={id} onClick={() => selectCommentScenario(id)}
                style={{ width: '100%', padding: '4px 8px', textAlign: 'left', borderRadius: '4px', border: '1px solid', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '10px', backgroundColor: commentScenario === id ? (id === 1 ? '#f0fdf4' : id === 2 ? '#fef2f2' : '#fffbeb') : '#f9fafb', borderColor: commentScenario === id ? (id === 1 ? '#16a34a' : id === 2 ? '#dc2626' : '#d97706') : '#d1d5db', color: commentScenario === id ? (id === 1 ? '#15803d' : id === 2 ? '#b91c1c' : '#b45309') : '#374151' }}>
                {COMMENT_SCENARIOS[id].label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: '600', color: '#6B7269', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🧪 Test Scenario</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
            {JOB_MAIN_SCENARIOS.map(({ id, label }) => (
              <button key={id} onClick={() => selectJobScenario(id)}
                style={{ width: '100%', padding: '4px 8px', textAlign: 'left', borderRadius: '4px', border: '1px solid', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '10px', backgroundColor: jobScenario === id ? (id === 1 ? '#f0fdf4' : '#fffbeb') : '#f9fafb', borderColor: jobScenario === id ? (id === 1 ? '#16a34a' : '#d97706') : '#d1d5db', color: jobScenario === id ? (id === 1 ? '#15803d' : '#b45309') : '#374151' }}>
                {label}
              </button>
            ))}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: '600', color: '#6B7269', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>⚠️ Scenario 3 — Non-valid (Outline)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
            {JOB_OUTLINE_SCENARIOS.map(({ id, label }) => (
              <button key={id} onClick={() => selectJobScenario(id)}
                style={{ width: '100%', padding: '4px 8px', textAlign: 'left', borderRadius: '4px', border: '1px solid', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '10px', backgroundColor: jobScenario === id ? '#fef2f2' : '#f9fafb', borderColor: jobScenario === id ? '#dc2626' : '#d1d5db', color: jobScenario === id ? '#b91c1c' : '#374151' }}>
                {label}
              </button>
            ))}
          </div>
        </>
      )}
      <div style={{ height: '1px', backgroundColor: '#E5E5E0', marginBottom: '8px' }} />
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6B7269', lineHeight: '1.4', margin: 0 }}>{activeDescription}</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', backgroundColor: '#1a2419', fontFamily: 'Inter, sans-serif' }}>

      {/* ══ SIDEBAR (desktop only) ═══════════════════════════════════════════ */}
      {!isPhone && (
      <aside style={{ width: '256px', flexShrink: 0, backgroundColor: '#1a2419', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', padding: '28px 0' }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '700', color: '#E8762F' }}>
            📖 CookBook
          </span>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>SE1 · Demo App</p>
        </div>

        {/* View mode toggle */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>View Mode</p>
          <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
            {([{ label: '🖥 Desktop', value: true }, { label: '📱 Mobile', value: false }] as const).map(({ label, value }) => (
              <button key={String(value)} onClick={() => setDesktopMode(value)}
                style={{
                  flex: 1, padding: '7px 8px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: '600', transition: 'all 0.15s',
                  backgroundColor: desktopMode === value ? '#E8762F' : 'transparent',
                  color: desktopMode === value ? '#fff' : 'rgba(255,255,255,0.45)',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <p style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px 8px' }}>Navigation</p>
          {navItems.map(({ view, label, emoji, action }) => {
            const isActive = activeView === view;
            return (
              <button key={view} onClick={action}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '2px', backgroundColor: isActive ? 'rgba(232,118,47,0.15)' : 'transparent', color: isActive ? '#E8762F' : 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: isActive ? '600' : '400', textAlign: 'left', transition: 'all 0.15s' }}>
                <span style={{ fontSize: '15px' }}>{emoji}</span>
                {label}
                {isActive && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#E8762F', flexShrink: 0 }} />}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: apiDot, flexShrink: 0 }} />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>{apiLabel}</span>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>Software Engineering I · 2025</p>
        </div>
      </aside>
      )}

      {/* ══ MAIN AREA ════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, position: 'relative' }}>

        {/* Top bar — desktop shell only; phone screens own their headers */}
        {!isPhone && (
        <header style={{ height: '60px', backgroundColor: '#1e2d1d', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 32px', gap: '10px', flexShrink: 0, position: 'relative' }}>
          <span style={{ fontSize: '20px' }}>{viewMeta.emoji}</span>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '700', color: '#FFFFFF', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{viewMeta.title}</h1>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{viewMeta.subtitle}</p>
          </div>
          {activeView !== 'home' && (
            <button onClick={goHome} style={{ marginLeft: 'auto', marginRight: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', fontSize: '12px', cursor: 'pointer' }}>
              ← Back to Home
            </button>
          )}
          {/* VM button — desktop canvas only */}
          {activeView !== 'home' && (
            <div style={{ position: 'relative', marginLeft: '0' }}>
              <button onClick={() => setMenuOpen(p => !p)}
                aria-label="Test scenarios"
                style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#6B7269', border: `3px solid ${vmRingColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '600', color: '#FFFFFF', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', transition: 'border-color 0.2s' }}>
                VM
              </button>
              {menuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(false)} />
                  <div style={{ position: 'absolute', top: '44px', right: 0, zIndex: 50 }}>
                    <ScenarioDropdown />
                  </div>
                </>
              )}
            </div>
          )}
        </header>
        )}

        <Suspense fallback={<ViewFallback />}>
          {effectiveDesktop ? (
            /* ── DESKTOP CANVAS ─────────────────────────────────────────── */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#1a2419' }}>
              {activeView === 'home' ? (
                <DesktopHome onRecipeSuggestions={goRecipes} onTopRecipeChart={goChart} onPostJob={goJob} />
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#FFFBF5' }}>
                  {showJobForm && (
                    <JobListingForm verificationStatus={jobConfig.verificationStatus} hasBan={jobConfig.hasBan} testScenario={jobScenario} onBack={goHome} desktop />
                  )}
                  {showRecipeSuggestions && (
                    <RecipeSuggestionsForm hasBan={commentConfig.hasBan} onBack={goHome} desktop />
                  )}
                  {showTopRecipeChart && (
                    <TopRecipeChart hasBan={commentConfig.hasBan} recipesCount={topChartConfig.recipesCount} onBack={goHome} desktop />
                  )}
                </div>
              )}
            </div>
          ) : isPhone ? (
            /* ── REAL PHONE: full-bleed, no device chrome ──────────────── */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#FFFBF5', position: 'relative' }}>
              {showJobForm
                ? <JobListingForm verificationStatus={jobConfig.verificationStatus} hasBan={jobConfig.hasBan} testScenario={jobScenario} onBack={goHome} />
                : showRecipeSuggestions
                ? <RecipeSuggestionsForm hasBan={commentConfig.hasBan} onBack={goHome} />
                : showTopRecipeChart
                ? <TopRecipeChart hasBan={commentConfig.hasBan} recipesCount={topChartConfig.recipesCount} onBack={goHome} showExitBar={false} />
                : <HomeScreen onPostJob={goJob} onRecipeSuggestions={goRecipes} onTopRecipeChart={goChart} />
              }
            </div>
          ) : (
            /* ── MOBILE PREVIEW: device frame scaled to fit ────────────── */
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#111820', overflow: 'hidden' }}>
              <div style={{ transform: `scale(${frameScale})`, transformOrigin: 'center center', borderRadius: '40px', padding: '12px', backgroundColor: '#111', boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ borderRadius: '30px', overflow: 'hidden', width: '393px', height: '852px', position: 'relative', backgroundColor: '#FFFBF5' }}>
                  {menuOpen && <div style={{ position: 'absolute', inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(false)} />}
                  <button onClick={() => setMenuOpen(p => !p)}
                    aria-label="Test scenarios"
                    style={{ position: 'absolute', top: '10px', right: '16px', zIndex: 50, width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#6B7269', border: `3px solid ${vmRingColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '600', color: '#FFFFFF', boxSizing: 'border-box', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', transition: 'border-color 0.2s' }}>
                    VM
                  </button>
                  {menuOpen && (
                    <div style={{ position: 'absolute', top: '56px', right: '16px', zIndex: 50 }}>
                      <ScenarioDropdown />
                    </div>
                  )}
                  {showJobForm
                    ? <JobListingForm verificationStatus={jobConfig.verificationStatus} hasBan={jobConfig.hasBan} testScenario={jobScenario} onBack={goHome} />
                    : showRecipeSuggestions
                    ? <RecipeSuggestionsForm hasBan={commentConfig.hasBan} onBack={goHome} />
                    : showTopRecipeChart
                    ? <TopRecipeChart hasBan={commentConfig.hasBan} recipesCount={topChartConfig.recipesCount} onBack={goHome} />
                    : <HomeScreen onPostJob={goJob} onRecipeSuggestions={goRecipes} onTopRecipeChart={goChart} />
                  }
                </div>
              </div>
            </div>
          )}
        </Suspense>

        {/* Phone: floating scenario control + bottom tab bar */}
        {isPhone && activeView !== 'home' && (
          <div style={{ position: 'absolute', right: '16px', bottom: '72px', zIndex: 60 }}>
            <button onClick={() => setMenuOpen(p => !p)}
              aria-label="Test scenarios"
              style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#6B7269', border: `3px solid ${vmRingColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', color: '#FFFFFF', cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.35)', boxSizing: 'border-box' }}>
              VM
            </button>
            {menuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(false)} />
                <ScenarioDropdown anchor="above" />
              </>
            )}
          </div>
        )}

        {isPhone && (
          <nav style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-around', gap: '2px', padding: '6px 4px calc(6px + env(safe-area-inset-bottom, 0px))', backgroundColor: '#1e2d1d', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            {navItems.map(({ view, short, emoji, action }) => {
              const isActive = activeView === view;
              return (
                <button key={view} onClick={action}
                  aria-label={short}
                  style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 2px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: isActive ? 'rgba(232,118,47,0.15)' : 'transparent', color: isActive ? '#E8762F' : 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: isActive ? '600' : '400' }}>
                  <span style={{ fontSize: '16px' }}>{emoji}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{short}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}