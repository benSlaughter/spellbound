import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { type ItemStats, canonicalMathsRef } from "@/lib/spaced-repetition";

interface RawRow {
  activity_ref: string;
  total: number;
  correct: number;
  helped: number;
  skipped: number;
  last_seen: string | null;
}

/**
 * GET /api/progress/items?kind=spelling|maths
 *
 * Returns per-item stats for spaced repetition scoring.
 * Groups all spelling game types or all maths game types together.
 * Maths refs are canonicalised (7x8 = 8x7).
 */
export async function GET(request: NextRequest) {
  try {
    const kind = request.nextUrl.searchParams.get("kind");

    if (kind !== "spelling" && kind !== "maths") {
      return NextResponse.json(
        { error: 'Query parameter "kind" must be "spelling" or "maths"' },
        { status: 400 },
      );
    }

    const db = getDb();
    const profileId = 1;
    const prefix = kind === "spelling" ? "spelling_%" : "maths_%";

    const rows = db
      .prepare(
        `SELECT activity_ref,
                COUNT(*) as total,
                SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) as correct,
                SUM(CASE WHEN result = 'helped' THEN 1 ELSE 0 END) as helped,
                SUM(CASE WHEN result = 'skipped' THEN 1 ELSE 0 END) as skipped,
                MAX(created_at) as last_seen
         FROM progress
         WHERE profile_id = ? AND activity_type LIKE ?
         GROUP BY activity_ref`,
      )
      .all(profileId, prefix) as RawRow[];

    // For maths, merge canonical duplicates (7x8 + 8x7 → 7x8)
    const statsMap = new Map<string, ItemStats>();

    for (const row of rows) {
      if (!row.activity_ref) continue;

      const ref =
        kind === "maths"
          ? canonicalMathsRef(row.activity_ref)
          : row.activity_ref;

      const existing = statsMap.get(ref);
      if (existing) {
        existing.correct += row.correct;
        existing.helped += row.helped;
        existing.skipped += row.skipped;
        existing.total += row.total;
        if (
          row.last_seen &&
          (!existing.lastSeen || row.last_seen > existing.lastSeen)
        ) {
          existing.lastSeen = row.last_seen;
        }
      } else {
        statsMap.set(ref, {
          ref,
          correct: row.correct,
          helped: row.helped,
          skipped: row.skipped,
          total: row.total,
          lastSeen: row.last_seen,
        });
      }
    }

    return NextResponse.json({
      kind,
      items: Array.from(statsMap.values()),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch item stats" },
      { status: 500 },
    );
  }
}
