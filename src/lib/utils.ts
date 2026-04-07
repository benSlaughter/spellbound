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
