# CookBook — SE1 Scenario Demo

A React + Vite prototype of **CookBook**, built for the **Software Engineering I & II** course.

The app is a working UI demo *and* a specification-conformance harness: every feature can be
driven into the exact state described by a Gherkin scenario from the SRS, so each acceptance
criterion can be demonstrated live instead of described.

## Features

| Feature | Description |
| --- | --- |
| **Recipe Suggestions** | Search recipes by available ingredients and maximum cooking time. Handles every outcome branch: success, time not fulfilled, ingredients not fulfilled, both, and four invalid-input cases. |
| **Top Recipe Chart** | Ranked leaderboard of up to 100 recipes (sorted by ranking, alphabetical on ties), with load banners for 25 / 100 / 500135 / 0 recipes and an empty state. |
| **Post a Job Listing** | Job form with validation, draft saving, and account checks (verified / unverified / pending / banned). |

Recipe detail views include a **comment section** with posting rules: empty input, banned-word
violation, and banned-account rejection.

## Running locally

Requires Node 18+ (developed on Node 22).

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run build       # production build to dist/
npm run preview     # serve the production build
```

No backend, database, or API keys are needed — all data is in-memory mock data and resets on reload.

## Demonstrating the scenarios

1. Open the app and pick a feature from the sidebar (or a card on the home screen).
2. Click the **VM** avatar in the top-right corner.
3. Choose a scenario from the dropdown.

| Scenario set | Cases |
| --- | --- |
| Job listing | `1` success · `2` missing fields → draft · `3a` unverified · `3b` active ban · `3c` pending review · `3d` unverified + ban |
| Top Recipe Chart | `TC-1` 25 recipes · `TC-2` 100 recipes · `TC-3` 500135 recipes (capped at 100) · `TC-4` 0 recipes |
| Comments | `C-1` no ban → success · `C-2` active ban · `C-3` no ban + banned word |

Banned words for `C-3`: `damn`, `hell`, `crap`, `stupid`, `idiot`, `hate`.

Detailed comment-moderation test cases are in [TESTING_INSTRUCTIONS.md](TESTING_INSTRUCTIONS.md).

## Tech stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4 (layout utilities; component styling is inline for precise design control)
- Inline SVG icons — no icon library dependency

## Structure

```
src/
├── main.tsx                  app entry point
├── app/
│   ├── App.tsx               shell, navigation, scenario state
│   └── components/
│       ├── HomeScreen.tsx            mobile home
│       ├── JobListingForm.tsx        job listing feature
│       ├── RecipeSuggestionsForm.tsx ingredient/time search feature
│       ├── TopRecipeChart.tsx        ranked leaderboard feature
│       ├── icons.tsx                 inline SVG icons
│       ├── VerifiedBadge.tsx
│       ├── figma/ImageWithFallback.tsx
│       └── recipe/
│           ├── types.ts              shared types
│           ├── constants.ts          design tokens, banned words, recipe data
│           ├── utils.ts              deterministic recipe generation
│           ├── useComments.ts        comment business rules
│           ├── CommentSection.tsx
│           ├── RecipeDetailView.tsx
│           └── RecipeListView.tsx
└── styles/                   fonts, Tailwind entry, theme tokens
```

Business rules are kept out of the view components: comment outcomes live in `useComments`,
recipe generation in `utils.ts`, and shared tokens/data in `constants.ts`.

## Notes

- Views are code-split with `React.lazy`; the home screen loads only the app shell.
- Desktop and mobile preview modes are both available from the sidebar.
- The prototype is intentionally stateless — no persistence layer is implemented.
