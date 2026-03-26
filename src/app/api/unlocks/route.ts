import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { GAMES_UNLOCKS } from '@/lib/unlocks';

export async function GET() {
  try {
    const db = getDb();
    const result = db
      .prepare(
        "SELECT COUNT(*) as total FROM progress WHERE profile_id = 1 AND result IN ('correct', 'helped')"
      )
      .get() as { total: number };

    const totalAnswers = result.total;
    const unlockedGames = GAMES_UNLOCKS.filter(
      (g) => totalAnswers >= g.requiredCorrect
    ).map((g) => g.href);

    return NextResponse.json({ totalAnswers, unlockedGames });
  } catch {
    return NextResponse.json({ totalAnswers: 0, unlockedGames: [] });
  }
}
