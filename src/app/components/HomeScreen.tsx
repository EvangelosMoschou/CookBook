import { VerifiedBadge } from './VerifiedBadge';

// ─── Shared style ─────────────────────────────────────────────────────────────

const HOME_BUTTON_STYLE: React.CSSProperties = {
  width: '100%',
  maxWidth: '320px',
  minHeight: '56px',
  padding: '12px 16px',
  backgroundColor: '#E8762F',
  borderRadius: '12px',
  fontFamily: 'Inter, sans-serif',
  fontSize: '16px',
  fontWeight: '600',
  color: '#FFFFFF',
  border: '2px solid #2D3E2C',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(232, 118, 47, 0.2)',
};

export function HomeScreen({ onPostJob, onRecipeSuggestions, onTopRecipeChart }: { 
  onPostJob: () => void; 
  onRecipeSuggestions: () => void;
  onTopRecipeChart: () => void;
}) {
  return (
    <div 
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        width: '100%', 
        height: '100%',
        backgroundColor: '#FFFBF5'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4"
        style={{ 
          height: '56px', 
          flexShrink: 0,
          backgroundColor: '#2D3E2C',
          borderBottom: '1px solid #E5E5E0' 
        }}
      >
        <h1 
          style={{ 
            fontFamily: 'Playfair Display, serif',
            fontSize: '20px',
            fontWeight: '700',
            color: '#FFFFFF'
          }}
        >
          CookBook
        </h1>
        
        {/* Verified User Avatar with VM Badge */}
        <VerifiedBadge />
      </div>

      {/* Main Content */}
      <div 
        className="flex flex-col items-center justify-center"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', gap: '16px', padding: '24px 20px' }}
      >
        <div className="text-center">
          <h2 
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(24px, 7vw, 28px)',
              fontWeight: '700',
              color: '#2D3E2C',
              marginBottom: '8px'
            }}
          >
            Welcome
          </h2>
          <p 
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(14px, 4vw, 16px)',
              color: '#6B7269',
              marginBottom: '16px'
            }}
          >
            Explore recipes and manage jobs
          </p>
        </div>

        {/* Recipe Suggestions Button */}
        <button
          onClick={onRecipeSuggestions}
          style={HOME_BUTTON_STYLE}
        >
          🔍 Recipe Suggestions
        </button>

        {/* Top Recipe Chart Button */}
        <button
          onClick={onTopRecipeChart}
          style={HOME_BUTTON_STYLE}
        >
          📊 Top Recipe Chart
        </button>

        {/* Post a Job Listing Button */}
        <button
          onClick={onPostJob}
          style={HOME_BUTTON_STYLE}
        >
          💼 Post a Job Listing
        </button>
      </div>
    </div>
  );
}