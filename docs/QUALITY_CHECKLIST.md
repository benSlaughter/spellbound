# Quality Checklist — Pause for Quality

A reusable audit checklist for SpellBound. Run this periodically — after a batch of features, before a release, or whenever it feels right. Update the results section each time.

References:
- `docs/DESIGN_PHILOSOPHY.md` — our core values
- `docs/GAME_DESIGN_RESEARCH.md` — the psychology behind our decisions
- `docs/RESEARCH_DR_MARCUS_CARTER.md` — what happens when games get it wrong
- `AGENTS.md` — conventions for code and structure

---

## The Checklist

### 1. Code Quality

| Check | How to verify | Pass criteria |
|-------|---------------|---------------|
| No `any` types | `grep -r ': any\|as any' src/ --include='*.ts' --include='*.tsx'` | Zero matches |
| No console.log in prod | `grep -rn 'console.log' src/ --include='*.ts' --include='*.tsx' \| grep -v test \| grep -v __tests__` | Zero matches (console.error is OK) |
| No TODO/FIXME/HACK | `grep -rn 'TODO\|FIXME\|HACK' src/` | Zero matches |
| No unused imports | `npm run lint 2>&1 \| grep 'no-unused-vars'` | Zero errors (warnings OK during dev) |
| ESLint clean | `npm run lint` | Zero errors |
| TypeScript clean | `npx tsc --noEmit` | Zero errors |

### 2. Tests

| Check | How to verify | Pass criteria |
|-------|---------------|---------------|
| All tests pass | `npm test` | 100% pass rate |
| Test count trending up | Check total in output | Should grow with features |
| All `src/lib/` files tested | Compare `ls src/lib/*.ts` with `ls src/lib/__tests__/` | Every lib file has a test file |
| API routes tested | Compare `find src/app/api -name route.ts` with test files | Critical routes have tests |
| No flaky tests | Check for `new Date()` or real timers in tests | Use `vi.useFakeTimers()` where time matters |

### 3. Security

| Check | How to verify | Pass criteria |
|-------|---------------|---------------|
| CSRF on mutations | All POST/PUT/DELETE routes call `checkCSRF()` | No unprotected mutations |
| Auth on admin routes | All admin routes call `checkAdminAuth()` | No unprotected admin endpoints |
| Input validation | All user input goes through `validateStringInput()` or equivalent | No raw input into SQL |
| No secrets in code | `grep -r 'password\|secret\|key' src/ \| grep -v '.test.' \| grep -v hash \| grep -v bcrypt` | No hardcoded credentials |

### 4. Performance

| Check | How to verify | Pass criteria |
|-------|---------------|---------------|
| No N+1 queries | Review API routes for loops with DB queries | All batch queries use JOINs or single queries |
| Database indexes | Review queries against `schema.sql` indexes | Frequently-filtered columns are indexed |
| No blocking fetches | Game pages load data in useEffect, not during render | No hydration mismatches |

### 5. Accessibility

| Check | How to verify | Pass criteria |
|-------|---------------|---------------|
| Interactive elements labelled | `grep -rn '<button\|<input' src/ \| grep -v aria-label \| grep -v '>'` | All have aria-label or visible text |
| Images have alt text | `grep -rn '<img' src/ \| grep -v alt \| grep -v aria-hidden` | All non-decorative images have alt |
| Touch targets ≥44px | Visual inspection on mobile | No tiny tap targets |
| Keyboard navigation | Tab through each game | All interactive elements reachable |

### 6. CSS & Design

| Check | How to verify | Pass criteria |
|-------|---------------|---------------|
| Inline styles minimised | `grep -rc 'style={{' src/ --include='*.tsx' \| awk -F: '{s+=$2} END {print s}'` | Trending down; dynamic positioning OK |
| Breadcrumbs on pages | Check all page files for `<Breadcrumbs />` | All non-home pages have breadcrumbs |
| Consistent CSS classes | Spot-check pages use `page-title`, `page-container`, etc. from globals.css | No ad-hoc duplicating standard classes |
| Equal-height cards | Visual check on game hub pages | Cards in same row match height |

### 7. Values Alignment

These checks come directly from `docs/DESIGN_PHILOSOPHY.md`. If any fail, it's a design issue, not just a code issue.

| Check | How to verify | Pass criteria |
|-------|---------------|---------------|
| No pressure timers | Search for countdown timers in learning games | Only fun games (Spot Match) may have timers |
| No numerical scores | Check game completion screens | No "X out of Y", no percentages, no grades |
| Growth-only counters | Check progress/garden page | Numbers only go up (words practised, streak) |
| Garden never shrinks | Review progress page logic | No decay, no wilting, no penalties |
| Encouraging wrong answers | Play each game, get answers wrong | Messages are gentle, never harsh |
| No FOMO mechanics | Review for limited-time content or expiring rewards | Nothing expires or is taken away |
| No leaderboards | Search for ranking/comparison features | No way to compare children |
| No loot boxes | Search for random reward mechanics | Surprises are always positive, never withheld |

---

## Latest Audit Results

**Date:** 2026-04-07
**Test count:** 246 across 22 files
**Lint:** 0 errors, 33 warnings

### ✅ Passing

- No `any` types
- No console.log in production
- No TODO/FIXME/HACK
- No hardcoded credentials
- All `src/lib/` files have tests
- CSRF checked on all mutations
- Auth checked on all admin routes
- Input validated before SQL
- No N+1 queries
- All interactive elements labelled
- No harsh wrong-answer messaging
- No leaderboards or rankings
- No FOMO mechanics or loot boxes
- No pressure timers in learning games (Spot Match timer is OK — it's a fun game)
- Garden never shrinks, numbers only go up

### ⚠️ Needs Attention

| Issue | Severity | Details |
|-------|----------|---------|
| 7 unused imports | Low | page.tsx (Plant), builder (Sparkle), catcher (useMemo), spelling/page (Link, PencilSimple), scramble (Sparkle), mountain (Star), bubbles (Check) |
| 6 API routes untested | Medium | challenge, settings, progress/items, unlocks, admin/login, admin/logout |
| 47 inline styles | Low | Most are dynamic positioning (unavoidable). Some static ones in memory (3D transforms) and catcher (gradients) could be CSS classes |
| Admin pages lack breadcrumbs | Low | Admin uses its own nav bar — breadcrumbs not needed there |
| 2 potentially flaky tests | Low | progress.test.ts and feedback.test.ts use real dates — could break on timezone edge cases |
| Missing DB indexes | Low | feedback(created_at), progress(profile_id, created_at) — not urgent at current scale |

### ✅ Previously Fixed (for reference)

These were caught in earlier audits and resolved:
- Spelling games not using `recordProgress()` helper → extracted to shared `utils.ts`
- Duplicate shuffle functions in 5 games → shared `shuffle()` in `utils.ts`
- Hydration warnings on Mountain/River → moved to `useEffect`
- Missing aria-label on Missing Letters input → added
- Coverage config excluding API routes → fixed
- Duplicate spelling words allowed → unique constraint added
- BackButton deprecated component → deleted

---

## How to Run This Audit

Quick automated checks:

```bash
# Code quality
npm run lint
grep -r ': any\|as any' src/ --include='*.ts' --include='*.tsx'
grep -rn 'console.log' src/ --include='*.ts' --include='*.tsx' | grep -v __tests__
grep -rn 'TODO\|FIXME\|HACK' src/

# Tests
npm test

# Inline styles count
grep -rc 'style={{' src/ --include='*.tsx' | awk -F: '{s+=$2} END {print "Inline styles:", s}'

# Security
grep -rn 'checkCSRF\|checkAdminAuth' src/app/api/ | grep -v __tests__
```

Manual checks (do these by playing the app):
- Play each game type, get answers wrong — is feedback always gentle?
- Complete a game — does celebration show?
- Check garden/progress page — are all numbers positive growth?
- Test on phone viewport — are all buttons ≥44px?
