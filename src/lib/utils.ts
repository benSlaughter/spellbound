/**
 * Fisher–Yates shuffle. Returns a new shuffled copy of the array.
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Record a learning activity and trigger achievement checks.
 * Posts to /api/progress then /api/achievements. Fire-and-forget.
 */
export async function recordProgress(
  activityType: string,
  activityRef: string,
  result: 'correct' | 'helped' | 'skipped',
) {
  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity_type: activityType, activity_ref: activityRef, result }),
    });
    if (!res.ok) console.error('Failed to record progress:', res.status);
    await fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Failed to record progress:', err);
  }
}

/**
 * Fetch per-item spaced repetition stats and reorder a spelling word list.
 * Returns words sorted weakest-first for optimal learning.
 * Falls back to original order if stats can't be fetched.
 */
export async function smartWordOrder<T extends { word: string }>(
  words: T[],
): Promise<T[]> {
  try {
    const { sortForSession } = await import('./spaced-repetition');
    const res = await fetch('/api/progress/items?kind=spelling');
    if (!res.ok) return words;

    const data = await res.json();
    const statsMap = new Map<string, { ref: string; correct: number; helped: number; skipped: number; total: number; lastSeen: string | null }>();
    for (const item of data.items) {
      statsMap.set(item.ref, item);
    }

    const orderedRefs = sortForSession(
      words.map(w => w.word),
      statsMap,
    );

    const wordMap = new Map(words.map(w => [w.word, w]));
    return orderedRefs
      .map(ref => wordMap.get(ref))
      .filter((w): w is T => w !== undefined);
  } catch {
    return words;
  }
}

/**
 * Fetch maths item stats for spaced repetition.
 * Returns a Map suitable for passing to generateQuestions().
 * Returns empty Map on failure (graceful fallback to random ordering).
 */
export async function fetchMathsStats(): Promise<Map<string, { ref: string; correct: number; helped: number; skipped: number; total: number; lastSeen: string | null }>> {
  try {
    const res = await fetch('/api/progress/items?kind=maths');
    if (!res.ok) return new Map();
    const data = await res.json();
    const statsMap = new Map<string, { ref: string; correct: number; helped: number; skipped: number; total: number; lastSeen: string | null }>();
    for (const item of data.items) {
      statsMap.set(item.ref, item);
    }
    return statsMap;
  } catch {
    return new Map();
  }
}
