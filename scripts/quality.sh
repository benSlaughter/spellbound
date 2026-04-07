#!/usr/bin/env bash
# SpellBound Quality Check
# Run: npm run quality (or bash scripts/quality.sh)
# See docs/QUALITY_CHECKLIST.md for the full checklist.

set -e

PASS=0
WARN=0
FAIL=0

pass() { echo "  ✅ $1"; PASS=$((PASS + 1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }

echo ""
echo "🌱 SpellBound Quality Check"
echo "═══════════════════════════"

# --- Code Quality ---
echo ""
echo "📝 Code Quality"

ANY_COUNT=$(grep -r ': any\|as any' src/ --include='*.ts' --include='*.tsx' 2>/dev/null | grep -v node_modules | grep -v __tests__ | wc -l | tr -d ' ')
if [ "$ANY_COUNT" = "0" ]; then pass "No 'any' types"; else fail "$ANY_COUNT 'any' types found"; fi

LOG_COUNT=$(grep -rn 'console.log' src/ --include='*.ts' --include='*.tsx' 2>/dev/null | grep -v __tests__ | wc -l | tr -d ' ')
if [ "$LOG_COUNT" = "0" ]; then pass "No console.log in production"; else fail "$LOG_COUNT console.log statements found"; fi

TODO_COUNT=$(grep -rn 'TODO\|FIXME\|HACK' src/ --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')
if [ "$TODO_COUNT" = "0" ]; then pass "No TODO/FIXME/HACK"; else warn "$TODO_COUNT TODO/FIXME/HACK comments"; fi

LINT_OUTPUT=$(npm run lint 2>&1)
LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -o '[0-9]* error' | head -1 | grep -o '[0-9]*' || echo "0")
LINT_WARNINGS=$(echo "$LINT_OUTPUT" | grep -o '[0-9]* warning' | head -1 | grep -o '[0-9]*' || echo "0")
if [ "$LINT_ERRORS" = "0" ] || [ -z "$LINT_ERRORS" ]; then
  pass "ESLint: 0 errors, ${LINT_WARNINGS:-0} warnings"
else
  fail "ESLint: $LINT_ERRORS errors, $LINT_WARNINGS warnings"
fi

# --- Tests ---
echo ""
echo "🧪 Tests"

TEST_OUTPUT=$(npm test 2>&1)
TEST_FILES=$(echo "$TEST_OUTPUT" | grep 'Test Files' | grep -o '[0-9]* passed' | grep -o '[0-9]*' || echo "0")
TEST_COUNT=$(echo "$TEST_OUTPUT" | grep 'Tests' | grep -v 'Test Files' | grep -o '[0-9]* passed' | grep -o '[0-9]*' || echo "0")
TEST_FAILED=$(echo "$TEST_OUTPUT" | grep 'Tests' | grep -v 'Test Files' | grep -o '[0-9]* failed' | grep -o '[0-9]*' || echo "0")

if [ "$TEST_FAILED" = "0" ] || [ -z "$TEST_FAILED" ]; then
  pass "All tests pass: $TEST_COUNT tests across $TEST_FILES files"
else
  fail "$TEST_FAILED tests failed ($TEST_COUNT total across $TEST_FILES files)"
fi

LIB_FILES=$(ls src/lib/*.ts 2>/dev/null | grep -v '.d.ts' | wc -l | tr -d ' ')
LIB_TESTS=$(ls src/lib/__tests__/*.test.ts 2>/dev/null | wc -l | tr -d ' ')
if [ "$LIB_FILES" = "$LIB_TESTS" ]; then pass "All src/lib/ files have tests ($LIB_FILES/$LIB_FILES)"; else warn "Lib test coverage: $LIB_TESTS/$LIB_FILES files tested"; fi

API_ROUTES=$(find src/app/api -name 'route.ts' 2>/dev/null | wc -l | tr -d ' ')
API_TESTS=$(ls src/app/api/__tests__/*.test.ts 2>/dev/null | wc -l | tr -d ' ')
if [ "$API_TESTS" -ge "$API_ROUTES" ]; then pass "All API routes tested ($API_TESTS/$API_ROUTES)"; else warn "API test coverage: $API_TESTS/$API_ROUTES routes tested"; fi

# --- Security ---
echo ""
echo "🔒 Security"

AUDIT_OUTPUT=$(npm audit 2>&1 || true)
if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
  pass "No known vulnerabilities (npm audit)"
else
  VULN_LINE=$(echo "$AUDIT_OUTPUT" | grep 'vulnerabilities' | tail -1)
  if [ -n "$VULN_LINE" ]; then warn "npm audit: $VULN_LINE"; else pass "No known vulnerabilities (npm audit)"; fi
fi

# --- Performance ---
echo ""
echo "⚡ Performance"

INLINE_STYLES=$(grep -rc 'style={{' src/ --include='*.tsx' 2>/dev/null | awk -F: '{s+=$2} END {print s}')
if [ "$INLINE_STYLES" -lt 30 ]; then pass "Inline styles: $INLINE_STYLES (good)"; elif [ "$INLINE_STYLES" -lt 60 ]; then warn "Inline styles: $INLINE_STYLES (some may be convertible)"; else fail "Inline styles: $INLINE_STYLES (review for cleanup)"; fi

# --- Build size ---
echo ""
echo "📦 Build"

if [ -d ".next/standalone" ]; then
  STANDALONE_SIZE=$(du -sh .next/standalone 2>/dev/null | cut -f1)
  pass "Standalone build exists ($STANDALONE_SIZE)"
else
  warn "No standalone build found (run npm run build to check)"
fi

# --- Docs ---
echo ""
echo "📚 Documentation"

for doc in README.md AGENTS.md docs/ROADMAP.md docs/DESIGN_PHILOSOPHY.md docs/QUALITY_CHECKLIST.md docs/api.md; do
  if [ -f "$doc" ]; then pass "$doc exists"; else warn "$doc missing"; fi
done

# --- Summary ---
echo ""
echo "═══════════════════════════"
echo "🌱 Results: $PASS passed, $WARN warnings, $FAIL failed"
echo "═══════════════════════════"
echo ""

if [ "$FAIL" -gt 0 ]; then exit 1; fi
exit 0
