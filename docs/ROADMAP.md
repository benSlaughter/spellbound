# SpellBound Roadmap

## Current State (v1.0)

16 games, admin area, Docker CI/CD, 211 tests, deployed behind HTTPS.
Visually QA'd across desktop, phone, and tablet. Solid foundation.

### Known Gaps

- No `prefers-reduced-motion` support
- No `next/image` optimisation (raw `<img>` everywhere)
- No custom 404 page
- No E2E tests
- No PWA/offline support
- Hydration warnings on Math Mountain + Number River
- No seed data script for fresh installs
- Default Next.js files still in `public/`
- Puzzle reveal images are placeholder SVGs

## Profile Modes

The app supports three deployment modes, built incrementally. A `profile_mode` setting in admin controls which is active.

### Mode 1: Single Learner (short term)
How it works now, plus the ability to set the child's name in admin. One profile, no picker, no login. Ideal for single-child families.

### Mode 2: Family (medium term)
A "Who are you?" screen on launch shows avatar cards with names. Tap your face → straight into your garden. No passwords. Each child gets their own progress, garden, and achievements. Admin creates/manages profiles. Designed for 2–5 kids on a family device.

### Mode 3: School (long term)
Username + kid-friendly password on launch. Supports many profiles (a whole class). Admin creates accounts, resets passwords. Login is simple — think picture password, colour code, or short PIN rather than complex text passwords. Designed for shared tablets in a classroom.

## Short Term — Polish (1–2 weeks)

Fix every rough edge. Make it feel professional.

- Fix hydration warnings (move `Math.random` into `useEffect`)
- Convert `<img>` to `next/image` across all components
- Add `prefers-reduced-motion` support for all Framer Motion animations
- Custom garden-themed 404 page
- Seed data script (`npm run seed`)
- Clean up `public/` (remove vercel.svg, globe.svg etc.) and `/dev/game` route
- Loading skeleton components instead of "Loading…" text
- E2E test suite with Playwright (critical user flows)
- Route-specific error boundaries (`spelling/error.tsx`, `maths/error.tsx`)
- "Continue where you left off" on home page
- **Profile name in admin** — let parent set the child's name (shown in greeting + sidebar)

## Medium Term — Deepen (1–2 months)

Make the garden feel alive. Add features that impress.

- **Family mode (Mode 2)** — avatar picker on launch, multiple profiles, no passwords
- **Character avatars** — child picks a garden character (used in family mode profile cards)
- **PWA / offline mode** — service worker, manifest, "Add to Home Screen"
- **Spaced repetition** — surface frequently-missed words/facts more often
- **Seasonal garden** — spring/summer/autumn/winter themes based on real date
- **Garden creatures** — butterflies for streaks, hedgehog at 10 games, robin in winter
- **3 new fun games** — Simon Says, Odd One Out, Target Number (Countdown-style)
- **Challenge mode** — weekly themed challenges with special badges
- **Sound upgrade** — warm audio samples replacing Web Audio synthesis
- **Parent insights** — weekly summary in admin, exportable PDF report
- **Database backup/restore** — admin button to download/upload SQLite file
- **Accessibility audit** — axe-core in CI, keyboard-only test suite

## Long Term — Scale (3–6 months)

Transform from single-child home app into something special.

- **School mode (Mode 3)** — username + kid-friendly password, many profiles, admin password reset
- **Handwriting practice** — canvas-based letter tracing (tablet/stylus)
- **Curriculum alignment** — map to UK National Curriculum Year 5/6
- **i18n** — Welsh, Irish, Scottish Gaelic, then French/Spanish
- **Dark mode** — warm amber/sepia for evening sessions
- **Import/export** — CSV spelling list import, printable worksheets
- **Open source release** — contributor docs, community self-hosting

## Principles

These don't change regardless of phase:

1. No pressure — no timers, no countdowns, no failure states
2. Always encouraging — garden never shrinks, language always positive
3. Child-first — big touch targets, clear text, friendly colours
4. Accessible — keyboard nav, screen reader support, reduced motion
5. Simple to run — single command, no external dependencies
6. Extensible — easy to add games, achievements, profiles
