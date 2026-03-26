<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SpellBound — Agent Guide

## What This Is

A gamified learning app for 10–11 year olds. Spelling + Maths. No pressure, all fun.

It's a parent's passion project — a home server app for one child. Keep the tone warm, the colours garden-themed, and never add scores, timers, or anything that feels like pressure.

## Repository Map

```
src/
├── app/                     # Next.js App Router pages and API routes
│   ├── page.tsx             # Home — 4 cards: Spelling, Maths, My Garden, Challenges
│   ├── layout.tsx           # Root layout with Sidebar
│   ├── globals.css          # Tailwind + global styles
│   ├── spelling/
│   │   ├── page.tsx         # Spelling hub — shows games if words exist
│   │   ├── builder/         # Word Builder game (hear word → type it)
│   │   ├── memory/          # Memory Match card game
│   │   ├── missing/         # Missing Letters fill-in
│   │   ├── scramble/        # Word Scramble unscramble game
│   │   └── wordsearch/      # Word Search grid game
│   ├── maths/
│   │   ├── page.tsx         # Maths hub — table selection + difficulty picker
│   │   ├── bubbles/         # Number Bubbles (pop the right answer)
│   │   ├── explorer/        # Times Table Explorer (interactive grid)
│   │   ├── mountain/        # Math Mountain (climb by solving)
│   │   ├── puzzle/          # Puzzle Pieces (reveal picture)
│   │   └── river/           # Number River (hop lily pads)
│   ├── progress/            # My Garden — visual progress + badges
│   ├── entry/               # Child word entry (add own spelling words)
│   ├── admin/               # Admin dashboard
│   │   ├── page.tsx         # Admin home
│   │   ├── spellings/       # Manage spelling lists
│   │   ├── progress/        # View child's progress
│   │   └── settings/        # App settings (password, reset)
│   └── api/                 # REST API (see docs/api.md)
│       ├── achievements/    # GET/POST achievements
│       ├── admin/login/     # POST login, GET auth check
│       ├── admin/logout/    # POST logout
│       ├── entry/           # POST child word entry
│       ├── progress/        # GET/POST progress tracking
│       ├── settings/        # GET/PUT app settings
│       └── spellings/       # CRUD spelling lists + [id]/activate
├── components/
│   ├── ui/                  # Shared UI primitives
│   │   ├── BackButton.tsx   # Animated back navigation
│   │   ├── Badge.tsx        # Achievement badge (locked/unlocked)
│   │   ├── Button.tsx       # Primary/secondary/fun button variants
│   │   ├── CelebrationOverlay.tsx  # Full-screen confetti celebration
│   │   ├── GameCard.tsx     # Game selection card (with locked state)
│   │   ├── LoadingSpinner.tsx  # Bouncing dots loader
│   │   └── ProgressStars.tsx   # Star rating display
│   └── layout/
│       └── Sidebar.tsx      # Desktop sidebar + mobile hamburger menu
└── lib/
    ├── db.ts                # Database access layer (all queries)
    ├── schema.sql           # SQLite schema (6 tables)
    ├── achievements.ts      # Achievement definitions + check functions
    ├── auth.ts              # Admin auth (sessions, cookies, CSRF, validation)
    ├── maths-helpers.ts     # Question generation + shuffle + encouragement
    └── sounds.ts            # Web Audio API synthesised sound effects
```

## Architecture

- **Next.js App Router** — server components for pages, `'use client'` for games
- **SQLite via better-sqlite3** — file-based DB at `data/spellbound.db`, synchronous API
- **API routes** under `src/app/api/` — JSON REST endpoints
- **Shared lib code** under `src/lib/` — database, auth, helpers, sounds
- **Single profile** — currently single-child, profile ID `1` is hardcoded in most places
- **No external services** — everything runs locally, no network calls

## Key Files

| File | What It Does |
|---|---|
| `src/lib/db.ts` | All database queries. Auto-creates DB and seeds defaults on first access. |
| `src/lib/schema.sql` | SQLite schema: profiles, spelling_lists, spelling_words, progress, achievements, settings |
| `src/lib/achievements.ts` | 10 achievement definitions with check functions against PlayerStats |
| `src/lib/auth.ts` | In-memory session store, bcrypt password verification, CSRF protection, input sanitisation |
| `src/lib/maths-helpers.ts` | Generates maths questions by table/difficulty, plus client-side progress recording |
| `src/lib/sounds.ts` | Web Audio API sound effects: success, click, achievement, pop, whoosh, splash |
| `src/middleware.ts` | Next.js middleware (check for any route protection) |
| `src/app/layout.tsx` | Root layout — wraps all pages with Sidebar |

## Database

### Schema (6 tables)

- **profiles** — user profiles (id, name, avatar). Default: "Learner" with "sprout" avatar
- **spelling_lists** — weekly word lists (profile_id, name, is_active, archived)
- **spelling_words** — individual words (list_id, word, hint)
- **progress** — activity log (profile_id, activity_type, activity_ref, result, created_at)
- **achievements** — unlocked badges (profile_id, achievement_key, unlocked_at)
- **settings** — key-value config (admin_password, etc.)

### Seeding

On first run, `seedDefaults()` in `db.ts` creates:
1. A default profile "Learner" with avatar "sprout"
2. An admin password "spellbound123" (bcrypt hashed)

### Activity Types

Progress records use `activity_type` to categorise:
- `spelling_builder`, `spelling_memory`, `spelling_missing`, `spelling_scramble`, `spelling_wordsearch`
- `maths_bubbles`, `maths_mountain`, `maths_puzzle`, `maths_river`, `maths_explorer`

Results are: `correct`, `helped`, or `skipped`

## Adding a New Game

1. **Create the page:** Add `src/app/spelling/<game-name>/page.tsx` or `src/app/maths/<game-name>/page.tsx`
2. **Mark it as a client component:** Add `'use client'` at the top
3. **For spelling games:** Fetch the active word list from `/api/spellings?active=true`
4. **For maths games:** Read `tables` and `difficulty` from URL search params, use `generateQuestions()` from `@/lib/maths-helpers`
5. **Record progress:** Call `recordProgress()` from `@/lib/maths-helpers` (client-side helper that POSTs to `/api/progress` then `/api/achievements`)
6. **Add a GameCard** to the hub page (`spelling/page.tsx` or `maths/page.tsx`)
7. **Use existing UI components:** `Button`, `CelebrationOverlay`, `BackButton`, `ProgressStars`
8. **Add sound effects:** Use `playSound('success')`, `playSound('pop')`, etc. from `@/lib/sounds`
9. **Update the achievement count** if adding a new game type — check `uniqueGameTypesPlayed` threshold in `achievements.ts`

## Adding a New Achievement

1. Open `src/lib/achievements.ts`
2. Add a new entry to the `achievements` array:
   ```typescript
   {
     key: "unique_snake_case_key",
     title: "Display Title",
     description: "Short description shown in the badge",
     emoji: "🎯",
     check: (stats) => stats.someField >= threshold,
   }
   ```
3. If the achievement needs a new stat, add the field to the `PlayerStats` interface and update the stats calculation in `src/app/api/achievements/route.ts` (the `GET` handler computes stats from the progress table)
4. The achievement is automatically checked on every `POST /api/achievements` call

## Conventions

### Code Style
- All game pages use `'use client'` — they need interactivity
- Framer Motion for animations (`import { motion, AnimatePresence } from 'framer-motion'`)
- Tailwind CSS for all styling — no CSS modules or styled-components
- Garden colour palette: greens (`emerald`, `green`), yellows (`amber`, `yellow`), blues (`sky`, `blue`), warm tones (`orange`, `rose`)

### UX Principles
- **Big touch targets** (min 44px) — kid-friendly
- **Never show scores, timers, or pressure** — always encouraging
- **Celebration on completion** — use `CelebrationOverlay` component
- **Encouraging messages** — use `randomEncouragement()` from maths-helpers

### Data Flow
- Record progress: `POST /api/progress` with `{ activity_type, activity_ref, result }`
- Check achievements: `POST /api/achievements` (no body needed — it recalculates from progress)
- Client-side helper: `recordProgress()` from `@/lib/maths-helpers` does both calls

### Sound Effects
Available sounds via `playSound()` from `@/lib/sounds`:
- `success` — correct answer (ascending C-E-G)
- `click` — button tap
- `achievement` — badge unlocked (fanfare)
- `pop` — bubble/item pop
- `whoosh` — transition/swipe
- `splash` — water effect

## Testing

- **Framework:** Vitest + React Testing Library (if configured)
- **Run:** `npm test`
- **Test locations:** `__tests__/` directories or `*.test.ts(x)` files
- **Lint:** `npm run lint` (ESLint)

## Common Tasks

### Change the admin password programmatically
Update the `admin_password` key in the settings table with a bcrypt hash.

### Reset a child's progress
`PUT /api/settings` with `{ key: "reset_progress", value: "true" }` (requires admin auth).

### Archive old spelling lists
`PUT /api/spellings/:id` with `{ is_active: false }` to deactivate, or handle archiving via the admin panel.

### Add new difficulty levels for maths
Edit the `Difficulty` type and `generateQuestions()` in `src/lib/maths-helpers.ts`. Current levels: `seedling` (×1–6), `sapling` (×1–12), `tree` (mixed ×÷), `mighty_oak` (÷ focus).

### Add new sound effects
Add a new function in `src/lib/sounds.ts`, add the name to the `SoundName` type, and add a case to the `playSound()` switch.
