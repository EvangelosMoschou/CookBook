import { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock, Star, ChefHat } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CommentSection } from './recipe/CommentSection';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecipeSuggestionsFormProps {
  onBack?: () => void;
  /** Driven by the shared commentScenario in App.tsx */
  hasBan: boolean;
  /** When true: removes fixed mobile dimensions, hides mobile header */
  desktop?: boolean;
}

interface Recipe {
  id: number;
  title: string;
  time: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  image: string;
  instructions: string;
}

type ResultType =
  | 'success'
  | 'timeNotFulfilled'
  | 'ingredientsNotFulfilled'
  | 'bothNotFulfilled'
  | 'invalidIngredients'
  | 'invalidTime'
  | 'invalidTimeNegative'
  | 'invalidBoth';

// Screen-based navigation — no modal for detail, it's a full page
type Screen = 'form' | 'list' | 'detail';
type ResultModal = 'result' | null;

// ─── Mock Recipe Database ─────────────────────────────────────────────────────

const RECIPE_DB: Recipe[] = [
  {
    id: 1,
    title: 'Fluffy Pancakes',
    time: 25,
    difficulty: 'Easy',
    ingredients: ['eggs', 'flour', 'sugar', 'milk', 'butter'],
    image: 'https://images.unsplash.com/photo-1744844564470-9141b3f4e265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbHVmZnklMjBwYW5jYWtlcyUyMGJyZWFrZmFzdCUyMHBsYXRlfGVufDF8fHx8MTc3NDI3NzUwMnww&ixlib=rb-4.1.0&q=80&w=400',
    instructions: 'Mix eggs, flour, sugar and milk into a smooth batter. Melt butter in a pan over medium heat and pour in batter. Cook until bubbles form, flip and cook 1 minute more.',
  },
  {
    id: 2,
    title: 'French Toast',
    time: 15,
    difficulty: 'Easy',
    ingredients: ['eggs', 'milk', 'bread', 'sugar'],
    image: 'https://images.unsplash.com/photo-1713025387177-ad42eb530242?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjB0b2FzdCUyMGVnZ3MlMjBicmVhZHxlbnwxfHx8fDE3NzQyNzc1MDN8MA&ixlib=rb-4.1.0&q=80&w=400',
    instructions: 'Beat eggs with milk and a pinch of sugar. Dip bread slices in the mixture and cook in a buttered pan until golden on both sides. Serve warm.',
  },
  {
    id: 3,
    title: 'Sugar Cookies',
    time: 30,
    difficulty: 'Medium',
    ingredients: ['sugar', 'flour', 'butter', 'eggs'],
    image: 'https://images.unsplash.com/photo-1773739687129-5a3eeee273f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWdhciUyMGNvb2tpZXMlMjBiYWtlZCUyMGRlc3NlcnR8ZW58MXx8fHwxNzc0Mjc3NTAzfDA&ixlib=rb-4.1.0&q=80&w=400',
    instructions: 'Cream butter and sugar, add eggs, then fold in flour. Roll out and cut into shapes. Bake at 180°C for 10–12 minutes until edges are just golden.',
  },
  {
    id: 4,
    title: 'Scrambled Eggs',
    time: 10,
    difficulty: 'Easy',
    ingredients: ['eggs', 'butter', 'salt'],
    image: 'https://images.unsplash.com/photo-1759216282444-8996a7ab60ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY3JhbWJsZWQlMjBlZ2dzJTIwb21lbGV0dGUlMjBza2lsbGV0fGVufDF8fHx8MTc3NDI3NzUwNHww&ixlib=rb-4.1.0&q=80&w=400',
    instructions: 'Whisk eggs with a pinch of salt. Melt butter in a pan over low heat, add eggs and stir gently until softly set. Remove from heat while still slightly runny.',
  },
  {
    id: 5,
    title: 'Omelette',
    time: 12,
    difficulty: 'Easy',
    ingredients: ['eggs', 'butter', 'cheese', 'salt'],
    image: 'https://images.unsplash.com/photo-1759216282444-8996a7ab60ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY3JhbWJsZWQlMjBlZ2dzJTIwb21lbGV0dGUlMjBza2lsbGV0fGVufDF8fHx8MTc3NDI3NzUwNHww&ixlib=rb-4.1.0&q=80&w=400',
    instructions: 'Beat eggs with salt. Melt butter in a pan, pour in eggs, add cheese and cook until just set. Fold in half and slide onto a plate.',
  },
  {
    id: 6,
    title: 'Chicken Salad',
    time: 20,
    difficulty: 'Easy',
    ingredients: ['chicken', 'lettuce', 'mayonnaise', 'lemon'],
    image: 'https://images.unsplash.com/photo-1641919055844-9e622d21cf7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwc2FsYWQlMjBib3dsJTIwZnJlc2h8ZW58MXx8fHwxNzc0Mjc3NTAzfDA&ixlib=rb-4.1.0&q=80&w=400',
    instructions: 'Shred cooked chicken and mix with lettuce, mayonnaise and a squeeze of lemon. Season with salt and pepper. Serve chilled.',
  },
  {
    id: 7,
    title: 'Chicken Tacos',
    time: 25,
    difficulty: 'Easy',
    ingredients: ['chicken', 'tortilla', 'salsa', 'cheese'],
    image: 'https://images.unsplash.com/photo-1641919055844-9e622d21cf7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwc2FsYWQlMjBib3dsJTIwZnJlc2h8ZW58MXx8fHwxNzc0Mjc3NTAzfDA&ixlib=rb-4.1.0&q=80&w=400',
    instructions: 'Season and cook chicken strips until golden. Warm tortillas, fill with chicken, salsa and cheese. Fold and serve immediately.',
  },
  {
    id: 8,
    title: 'Chicken Stir Fry',
    time: 28,
    difficulty: 'Medium',
    ingredients: ['chicken', 'vegetables', 'soy sauce', 'garlic'],
    image: 'https://images.unsplash.com/photo-1564636242997-77953084df48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMGRpbm5lciUyMHBsYXRlfGVufDF8fHx8MTc3NDI3NzUwNHww&ixlib=rb-4.1.0&q=80&w=400',
    instructions: 'Slice chicken and marinate in soy sauce and garlic. Stir-fry in a hot wok with vegetables for 8–10 minutes. Serve over rice.',
  },
  {
    id: 9,
    title: 'Grilled Chicken',
    time: 35,
    difficulty: 'Medium',
    ingredients: ['chicken', 'olive oil', 'salt', 'pepper'],
    image: 'https://images.unsplash.com/photo-1564636242997-77953084df48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMGRpbm5lciUyMHBsYXRlfGVufDF8fHx8MTc3NDI3NzUwNHww&ixlib=rb-4.1.0&q=80&w=400',
    instructions: 'Brush chicken pieces with olive oil, season generously. Grill over medium-high heat, 6–8 min per side, until juices run clear.',
  },
  {
    id: 10,
    title: 'BBQ Chicken',
    time: 40,
    difficulty: 'Medium',
    ingredients: ['chicken', 'bbq sauce', 'garlic', 'butter'],
    image: 'https://images.unsplash.com/photo-1564636242997-77953084df48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMGRpbm5lciUyMHBsYXRlfGVufDF8fHx8MTc3NDI3NzUwNHww&ixlib=rb-4.1.0&q=80&w=400',
    instructions: 'Marinate chicken in BBQ sauce and garlic for 15 min. Cook on the grill, basting with extra sauce every 5 minutes until caramelised and cooked through.',
  },
  {
    id: 11,
    title: 'Butter Cake',
    time: 60,
    difficulty: 'Hard',
    ingredients: ['butter', 'sugar', 'flour', 'eggs', 'milk'],
    image: 'https://images.unsplash.com/photo-1773739687129-5a3eeee273f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWdhciUyMGNvb2tpZXMlMjBiYWtlZCUyMGRlc3NlcnR8ZW58MXx8fHwxNzc0Mjc3NTAzfDA&ixlib=rb-4.1.0&q=80&w=400',
    instructions: 'Cream butter and sugar until light. Beat in eggs one at a time, then alternate flour and milk. Bake at 175°C for 45 minutes.',
  },
];

const MIN_RECIPE_TIME = 15;

// ─── Validation ───────────────────────────────────────────────────────────────

function ingredientHasInvalidChars(value: string): boolean {
  return /[^a-zA-Z\s,]/.test(value);
}

function validateTime(value: string): 'invalidChars' | 'invalidInput' | null {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) return 'invalidChars';
  if (parseInt(trimmed, 10) <= 0) return 'invalidInput';
  return null;
}

// ─── Search logic ─────────────────────────────────────────────────────────────

function runSearch(
  ingredients: string,
  maxTimeStr: string,
): { resultType: ResultType; recipes: Recipe[] } {
  const userIngs = ingredients
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const maxTime = parseInt(maxTimeStr.trim(), 10);

  const ingredientMatches = RECIPE_DB.filter((recipe) =>
    recipe.ingredients.some((recIng) =>
      userIngs.some(
        (userIng) =>
          recIng.toLowerCase().includes(userIng) ||
          userIng.includes(recIng.toLowerCase()),
      ),
    ),
  );

  if (ingredientMatches.length === 0) {
    if (maxTime < MIN_RECIPE_TIME) return { resultType: 'bothNotFulfilled', recipes: [] };
    return { resultType: 'ingredientsNotFulfilled', recipes: [] };
  }

  const timeMatches = ingredientMatches.filter((r) => r.time <= maxTime);
  if (timeMatches.length > 0) return { resultType: 'success', recipes: timeMatches };

  const closest = [...ingredientMatches].sort((a, b) => a.time - b.time).slice(0, 5);
  return { resultType: 'timeNotFulfilled', recipes: closest };
}

// ─── Result metadata ──────────────────────────────────────────────────────────

const RESULT_META: Record<ResultType, {
  message: string;
  icon: 'success' | 'warning' | 'error';
  subtitle: string;
  primaryBtn: string;
  showList: boolean;
}> = {
  success:                { message: 'Search was Succesful!',                              icon: 'success', subtitle: 'Compatible recipes found for your ingredients and time.',        primaryBtn: 'View Recipes',          showList: true  },
  timeNotFulfilled:       { message: 'Time requirement not fulfilled!',                    icon: 'warning', subtitle: 'Here are the 5 fastest recipes matching your ingredients.',      primaryBtn: 'View Closest Recipes',  showList: true  },
  ingredientsNotFulfilled:{ message: 'Ingredients requirement not fulfilled!',             icon: 'error',   subtitle: 'No recipes match the ingredients you entered.',                  primaryBtn: '',                      showList: false },
  bothNotFulfilled:       { message: 'Ingredients and time requirements not fulfilled!',   icon: 'error',   subtitle: 'No recipes match your ingredients or your time constraint.',     primaryBtn: '',                      showList: false },
  invalidIngredients:     { message: 'Invalid characters for Ingredients filter!',         icon: 'error',   subtitle: 'Ingredients must contain only letters, spaces, and commas.',     primaryBtn: '',                      showList: false },
  invalidTime:            { message: 'Invalid characters for time filter!',                icon: 'error',   subtitle: 'Time must be a positive whole number (e.g. 30).',                primaryBtn: '',                      showList: false },
  invalidTimeNegative:    { message: 'Invalid input for time filter(need time>0)!',        icon: 'error',   subtitle: 'Please enter a time greater than zero.',                         primaryBtn: '',                      showList: false },
  invalidBoth:            { message: 'Invalid characters for both filters!',               icon: 'error',   subtitle: 'Both fields contain invalid characters. Use only letters/commas for ingredients and positive numbers for time.', primaryBtn: '', showList: false },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: '#5A8F56',
  Medium: '#E8762F',
  Hard: '#C84538',
};

// ─── Shared header ────────────────────────────────────────────────────────────

function PageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{
      height: '56px',
      backgroundColor: '#2D3E2C',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
    }}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontSize: '14px', cursor: 'pointer', padding: '8px 0' }}
      >
        ← Back
      </button>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>
        {title}
      </h1>
      {/* Spacer — the App-level VM button sits here absolutely */}
      <div style={{ width: '36px', height: '36px' }} />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecipeSuggestionsForm({ onBack, hasBan, desktop }: RecipeSuggestionsFormProps) {
  const [ingredients, setIngredients]     = useState('');
  const [maxTime, setMaxTime]             = useState('');
  const [screen, setScreen]               = useState<Screen>('form');
  const [resultType, setResultType]       = useState<ResultType | null>(null);
  const [foundRecipes, setFoundRecipes]   = useState<Recipe[]>([]);
  const [resultModal, setResultModal]     = useState<ResultModal>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSearch = () => {
    const ingTrimmed  = ingredients.trim();
    const timeTrimmed = maxTime.trim();

    if (!ingTrimmed)  { setResultType('invalidIngredients'); setResultModal('result'); return; }
    if (!timeTrimmed) { setResultType('invalidTime');        setResultModal('result'); return; }

    const ingBad    = ingredientHasInvalidChars(ingTrimmed);
    const timeError = validateTime(timeTrimmed);

    if (ingBad && timeError === 'invalidChars') { setResultType('invalidBoth');           setResultModal('result'); return; }
    if (ingBad)                                  { setResultType('invalidIngredients');    setResultModal('result'); return; }
    if (timeError === 'invalidChars')            { setResultType('invalidTime');           setResultModal('result'); return; }
    if (timeError === 'invalidInput')            { setResultType('invalidTimeNegative');   setResultModal('result'); return; }

    const { resultType: rt, recipes } = runSearch(ingTrimmed, timeTrimmed);
    setResultType(rt);
    setFoundRecipes(recipes);
    setResultModal('result');
  };

  const handleClearFilters = () => {
    setIngredients(''); setMaxTime(''); setResultType(null);
    setFoundRecipes([]); setScreen('form'); setResultModal(null); setSelectedRecipe(null);
  };

  const handleViewRecipes  = () => { setScreen('list');   setResultModal(null); };
  const handleEditFilters  = () => { setScreen('form');   setResultModal(null); setResultType(null); };
  const handleOpenDetail   = (r: Recipe) => { setSelectedRecipe(r); setScreen('detail'); };
  const handleExitDetail   = () => { setScreen('list'); setSelectedRecipe(null); };
  const handleExit         = () => { if (onBack) onBack(); };

  const meta = resultType ? RESULT_META[resultType] : null;

  // Back-button target depends on current screen
  const headerBack =
    screen === 'detail' ? handleExitDetail :
    screen === 'list'   ? () => { setScreen('form'); setResultType(null); } :
    onBack ?? (() => {});

  const headerTitle =
    screen === 'detail' ? 'Recipe Details' :
    'Recipe Suggestions';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      ...(desktop ? { width: '100%', minHeight: '100%' } : { width: '393px', height: '852px', overflow: 'hidden' }),
      backgroundColor: '#FFFBF5',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      {!desktop && <PageHeader title={headerTitle} onBack={headerBack} />}

      {/* ════════════════════════ FORM SCREEN ════════════════════════ */}
      {screen === 'form' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>

          {/* Intro */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#E8762F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <ChefHat size={28} color="#FFFFFF" />
            </div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '700', color: '#2D3E2C', margin: '0 0 6px 0' }}>
              Find Your Perfect Recipe
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7269', margin: 0 }}>
              Enter ingredients and cooking time to discover recipes
            </p>
          </div>

          {/* Ingredients */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '600', color: '#1F2420', display: 'block', marginBottom: '8px' }}>
              Ingredients <span style={{ color: '#C84538' }}>*</span>
            </label>
            <input
              type="text" value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g., eggs, flour, sugar"
              style={{ width: '100%', height: '48px', backgroundColor: '#FFFFFF', border: '1.5px solid #D0CFC9', borderRadius: '10px', padding: '0 14px', fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#1F2420', boxSizing: 'border-box', outline: 'none' }}
            />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6B7269', margin: '5px 0 0 2px' }}>Separate multiple ingredients with commas</p>
          </div>

          {/* Time */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '600', color: '#1F2420', display: 'block', marginBottom: '8px' }}>
              Maximum Cooking Time (minutes) <span style={{ color: '#C84538' }}>*</span>
            </label>
            <input
              type="text" value={maxTime}
              onChange={(e) => setMaxTime(e.target.value)}
              placeholder="e.g., 30"
              style={{ width: '100%', height: '48px', backgroundColor: '#FFFFFF', border: '1.5px solid #D0CFC9', borderRadius: '10px', padding: '0 14px', fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#1F2420', boxSizing: 'border-box', outline: 'none' }}
            />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6B7269', margin: '5px 0 0 2px' }}>Enter a positive whole number (e.g. 30)</p>
          </div>

          {/* Actions */}
          <button onClick={handleSearch} style={{ width: '100%', height: '52px', backgroundColor: '#E8762F', borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', color: '#FFFFFF', border: 'none', cursor: 'pointer', marginBottom: '12px', boxShadow: '0 2px 8px rgba(232,118,47,0.35)' }}>
            🔍 Search Recipes
          </button>
          <button onClick={handleClearFilters} style={{ width: '100%', height: '48px', backgroundColor: 'transparent', border: '2px solid #2D3E2C', borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '500', color: '#2D3E2C', cursor: 'pointer' }}>
            Clear Filters
          </button>

          {/* Tip card */}
          <div style={{ marginTop: '28px', backgroundColor: '#F0F4EF', borderRadius: '12px', padding: '14px 16px', borderLeft: '4px solid #2D3E2C' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#2D3E2C', fontWeight: '600', margin: '0 0 4px 0' }}>💡 Tips for best results</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#4A5E49', margin: 0, lineHeight: '1.5' }}>
              Use common ingredient names separated by commas. Enter the maximum time you have available in minutes.
            </p>
          </div>

          {/* Quick examples */}
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '600', color: '#6B7269', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚡ Quick Examples</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: '🥚 Eggs, flour, sugar · 30 min',   ing: 'eggs, flour, sugar',  time: '30' },
                { label: '🍗 Chicken, lettuce · 25 min',     ing: 'chicken, lettuce',    time: '25' },
                { label: '🧈 Butter, sugar, eggs · 60 min',  ing: 'butter, sugar, eggs', time: '60' },
              ].map(({ label, ing, time: t }) => (
                <button key={label} onClick={() => { setIngredients(ing); setMaxTime(t); }}
                  style={{ width: '100%', height: '40px', backgroundColor: '#FFFFFF', border: '1.5px solid #D0CFC9', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#2D3E2C', cursor: 'pointer', textAlign: 'left', padding: '0 14px' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ LIST SCREEN ════════════════════════ */}
      {screen === 'list' && resultType && meta && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Status banner */}
          <div style={{ backgroundColor: resultType === 'success' ? '#E8F5E9' : '#FFF3E0', borderBottom: `2px solid ${resultType === 'success' ? '#5A8F56' : '#E8762F'}`, padding: '12px 16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {resultType === 'success' ? <CheckCircle size={22} color="#5A8F56" /> : <AlertCircle size={22} color="#E8762F" />}
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '700', color: resultType === 'success' ? '#2D3E2C' : '#9A4E0A', margin: 0 }}>{meta.message}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6B7269', margin: '2px 0 0 0' }}>
                  {foundRecipes.length} recipe{foundRecipes.length !== 1 ? 's' : ''} shown · ingredients: {ingredients} · {maxTime} min
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable recipe cards */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            {foundRecipes.map((recipe) => (
              <div
                key={recipe.id}
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 2px 8px rgba(45,62,44,0.07)' }}
              >
                <div style={{ display: 'flex', height: '90px' }}>
                  <div style={{ width: '90px', height: '90px', flexShrink: 0 }}>
                    <ImageWithFallback src={recipe.image} alt={recipe.title} style={{ width: '90px', height: '90px', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '700', color: '#1F2420', margin: '0 0 4px 0' }}>{recipe.title}</p>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6B7269', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={11} />{recipe.time} min
                        </span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: '600', color: '#FFFFFF', backgroundColor: DIFFICULTY_COLOR[recipe.difficulty], padding: '2px 8px', borderRadius: '20px' }}>
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleOpenDetail(recipe)}
                      style={{ alignSelf: 'flex-end', background: 'none', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '600', color: '#E8762F', cursor: 'pointer', padding: 0 }}>
                      View Recipe →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Exit bar */}
          <div style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E5E0', padding: '14px 16px', flexShrink: 0 }}>
            <button onClick={handleExit} style={{ width: '100%', height: '48px', backgroundColor: 'transparent', border: '2px solid #2D3E2C', borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '500', color: '#2D3E2C', cursor: 'pointer' }}>
              Exit Interface
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════ DETAIL SCREEN (full-page, matches Top Recipe Chart style) ══════════════════════ */}
      {screen === 'detail' && selectedRecipe && (
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* Hero image */}
          <div style={{ position: 'relative', height: '200px', flexShrink: 0 }}>
            <ImageWithFallback
              src={selectedRecipe.image}
              alt={selectedRecipe.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.65))' }} />
            <h2 style={{ position: 'absolute', bottom: '14px', left: '16px', fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
              {selectedRecipe.title}
            </h2>
          </div>

          <div style={{ padding: '20px 16px' }}>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div style={{ flex: 1, backgroundColor: '#F0F4EF', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <Clock size={18} color="#2D3E2C" style={{ margin: '0 auto 4px' }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '700', color: '#2D3E2C', margin: 0 }}>{selectedRecipe.time} min</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#6B7269', margin: '3px 0 0 0' }}>Cook time</p>
              </div>
              <div style={{ flex: 1, backgroundColor: '#F0F4EF', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <Star size={18} color={DIFFICULTY_COLOR[selectedRecipe.difficulty]} style={{ margin: '0 auto 4px' }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '700', color: DIFFICULTY_COLOR[selectedRecipe.difficulty], margin: 0 }}>{selectedRecipe.difficulty}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#6B7269', margin: '3px 0 0 0' }}>Difficulty</p>
              </div>
            </div>

            {/* Ingredients */}
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', color: '#1F2420', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ingredients</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
              {selectedRecipe.ingredients.map((ing) => (
                <span key={ing} style={{ backgroundColor: '#F0F4EF', border: '1px solid #C8D8C6', borderRadius: '20px', padding: '4px 12px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#2D3E2C', textTransform: 'capitalize' }}>
                  {ing}
                </span>
              ))}
            </div>

            {/* Instructions */}
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700', color: '#1F2420', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Instructions</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#4A5E49', lineHeight: '1.7', margin: '0 0 28px 0' }}>
              {selectedRecipe.instructions}
            </p>

            {/* ── Comment Section — same as Top Recipe Chart, driven by shared App.tsx state ── */}
            <CommentSection
              hasBan={hasBan}
              onExit={handleExitDetail}
            />
          </div>
        </div>
      )}

      {/* ════════════════════════ RESULT MODAL (search outcome) ════════════════════════ */}
      {resultModal === 'result' && meta && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: '355px', backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '28px 24px', boxShadow: '0 12px 48px rgba(0,0,0,0.28)' }} onClick={(e) => e.stopPropagation()}>

            {/* Icon */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              {meta.icon === 'success' && (
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <CheckCircle size={36} color="#5A8F56" />
                </div>
              )}
              {meta.icon === 'warning' && (
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <AlertCircle size={36} color="#E8762F" />
                </div>
              )}
              {meta.icon === 'error' && (
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FEECEC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <XCircle size={36} color="#C84538" />
                </div>
              )}
            </div>

            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '19px', fontWeight: '700', color: meta.icon === 'success' ? '#2D6A2D' : meta.icon === 'warning' ? '#9A4E0A' : '#C84538', textAlign: 'center', margin: '0 0 8px 0', lineHeight: '1.3' }}>
              {meta.message}
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7269', textAlign: 'center', lineHeight: '1.5', margin: '0 0 22px 0' }}>
              {meta.subtitle}
            </p>

            {meta.showList ? (
              <>
                <button onClick={handleViewRecipes} style={{ width: '100%', height: '48px', backgroundColor: meta.icon === 'success' ? '#2D3E2C' : '#E8762F', borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '600', color: '#FFFFFF', border: 'none', cursor: 'pointer', marginBottom: '10px' }}>
                  {meta.primaryBtn}
                </button>
                <button onClick={handleExit} style={{ width: '100%', height: '48px', backgroundColor: 'transparent', border: '2px solid #2D3E2C', borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '500', color: '#2D3E2C', cursor: 'pointer' }}>
                  Exit Interface
                </button>
              </>
            ) : (
              <>
                <button onClick={handleEditFilters} style={{ width: '100%', height: '48px', backgroundColor: '#E8762F', borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '600', color: '#FFFFFF', border: 'none', cursor: 'pointer', marginBottom: '10px' }}>
                  Edit Filters
                </button>
                <button onClick={handleExit} style={{ width: '100%', height: '48px', backgroundColor: 'transparent', border: '2px solid #2D3E2C', borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '500', color: '#2D3E2C', cursor: 'pointer' }}>
                  Exit Interface
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}