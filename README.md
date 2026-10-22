# CookBook — SE1 Scenario Demo

A full-stack prototype of **CookBook**, built for the **Software Engineering I & II** course.

The app is a working UI *and* a specification-conformance harness: every feature can be driven
into the exact state described by a Gherkin scenario from the SRS, so each acceptance criterion
can be demonstrated live instead of described. Data can come from the deterministic mock layer
or from a real SQLite-backed API.

## Features

| Feature | Description |
| --- | --- |
| **Recipe Suggestions** | Search recipes by available ingredients and maximum cooking time. Handles every outcome branch: success, time not fulfilled, ingredients not fulfilled, both, and four invalid-input cases. |
| **Top Recipe Chart** | Ranked leaderboard of up to 100 recipes (sorted by ranking, alphabetical on ties), with load banners for 25 / 100 / 500135 / 0 recipes and an empty state. |
| **Post a Job Listing** | Job form with validation, draft saving, and account checks (verified / unverified / pending / banned). |

Recipe detail views include a **comment section** with posting rules: empty input, banned-word
violation, and banned-account rejection.

## Architecture

```
browser ──► React 18 + Vite 6 (src/)
                │  data layer: mock | api
                ▼
          Express 5 API (server/)
                │  repositories
                ▼
          SQLite (better-sqlite3) + SQL migrations
```

- **Server** — Express 5 with layered structure: routes → repositories → SQLite. Schema and
  constraints live in `server/db/migrations/`, applied automatically on startup and tracked in
  `schema_migrations`. Validation and the banned-word policy are enforced **server-side**, so
  they cannot be bypassed by calling the API directly.
- **Client** — a typed `fetch` client in `src/app/data/` with one module per resource. The
  `VITE_DATA_SOURCE` flag selects the mock scenarios or the real API.
- **Database** — the schema ships **empty**. Migrations create `users`, `recipes`, `comments`
  and `job_listings` with foreign keys, check constraints and indexes; no rows are seeded.

### API

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | Status + row counts |
| `GET` | `/api/recipes` | Paginated, ranked order |
| `GET` | `/api/recipes/:id` | 404 when missing |
| `GET` | `/api/recipes/:id/comments` | Newest first |
| `POST` | `/api/recipes/:id/comments` | 403 banned account · 422 violation/empty |
| `GET` | `/api/jobs` | Paginated, newest first |
| `POST` | `/api/jobs` | 403 account checks · 422 missing fields |
| `GET` | `/api/users/:handle` | Account state |

Callers are identified by the `x-user-handle` header (placeholder auth); with an empty database
requests are anonymous.

## Running locally

Requires Node 18+ (developed on Node 22).

```bash
npm install
npm run dev        # API on :3001 + web on :5173
```

Open **http://localhost:5173**.

| Script | Purpose |
| --- | --- |
| `npm run dev` | API and web together |
| `npm run dev:web` / `dev:api` | Run one side only |
| `npm run build` / `preview` | Production build / preview |
| `npm run db:migrate` | Apply migrations |
| `npm run db:reset` | Drop and recreate the local database |
| `npm run typecheck` | Type-check client and server |

### Data source

```bash
npm run dev                      # mock data (default) — scenario demos work offline
VITE_DATA_SOURCE=api npm run dev # real SQLite API; DB starts empty, so empty states render
```

Copy `.env.example` to `.env` to set defaults. The sidebar footer shows which source is active
and, in api mode, whether the backend is reachable.

## Demonstrating the scenarios

1. Open a feature from the navigation.
2. Click the **VM** avatar (desktop: top-right; phone: floating button).
3. Pick a scenario.

| Scenario set | Cases |
| --- | --- |
| Job listing | `1` success · `2` missing fields → draft · `3a` unverified · `3b` active ban · `3c` pending review · `3d` unverified + ban |
| Top Recipe Chart | `TC-1` 25 recipes · `TC-2` 100 recipes · `TC-3` 500135 recipes (capped at 100) · `TC-4` 0 recipes |
| Comments | `C-1` no ban → success · `C-2` active ban · `C-3` no ban + banned word |

Banned words for `C-3`: `damn`, `hell`, `crap`, `stupid`, `idiot`, `hate` (whole words only, so
"shellfish" is not flagged). Detailed cases: [TESTING_INSTRUCTIONS.md](TESTING_INSTRUCTIONS.md).

## Responsive behaviour

- **Phones (< 900 px)** — full-bleed layout, bottom tab bar, floating scenario control, safe-area
  padding. No fixed widths.
- **Tablets and desktops** — sidebar shell; the *Mobile* view mode renders the 393 × 852 phone
  frame, automatically scaled down so it never overflows short windows.
- Verified without horizontal overflow at 375×667, 393×852, 667×375, 768×1024, 1024×768,
  1440×900, 1920×1080 and 1280×600 (scaled preview).

## Tech stack

React 18, TypeScript, Vite 6, Express 5, better-sqlite3, Tailwind CSS v4 (layout utilities;
component styling is inline for precise design control). Inline SVG icons — no icon library.

## Structure

```
server/
├── index.ts                 Express bootstrap, migrations on boot
├── env.ts                   PORT, DB_PATH
├── db/                      connection, migrations, reset
├── domain/                  shared types, content policy
├── repositories/            recipes, comments, jobs, users
└── http/                    router, error handling

src/
├── main.tsx
├── app/
│   ├── App.tsx              shell, navigation, scenario state, responsive layout
│   ├── data/                API client, repositories, data-source config, health hook
│   ├── hooks/useViewport.ts viewport tracking, breakpoint
│   └── components/          features + recipe/ domain module
└── styles/                  fonts, Tailwind entry, theme tokens
```

Business rules are kept out of view components: comment outcomes live in `useComments`,
recipe generation in `utils.ts`, and shared tokens/data in `constants.ts`.

## Notes

- Views are code-split with `React.lazy`; the home screen loads only the app shell.
- The mock layer is intentionally stateless. In api mode, comments and job listings persist to
  SQLite; recipe creation is available through the repository/API only (no admin UI).
- Authentication is a placeholder (`x-user-handle` header) rather than a real session system.
