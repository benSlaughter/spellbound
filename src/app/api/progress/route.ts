import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface ProgressEntry {
  id: number;
  profile_id: number;
  activity_type: string;
  activity_ref: string | null;
  result: string;
  created_at: string;
}

export async function GET() {
  try {
    const db = getDb();
    const profileId = 1; // default profile

    // Total games played
    const totalGames = db
      .prepare(
        "SELECT COUNT(*) as count FROM progress WHERE profile_id = ?"
      )
      .get(profileId) as { count: number };

    // Words practised (unique activity_refs for spelling activities)
    const wordsPractised = db
      .prepare(
        "SELECT COUNT(DISTINCT activity_ref) as count FROM progress WHERE profile_id = ? AND activity_type LIKE 'spelling_%'"
      )
      .get(profileId) as { count: number };

    // Maths facts practised
    const mathsPractised = db
      .prepare(
        "SELECT COUNT(DISTINCT activity_ref) as count FROM progress WHERE profile_id = ? AND activity_type LIKE 'maths_%'"
      )
      .get(profileId) as { count: number };

    // Recent activity (last 20)
    const recentActivity = db
      .prepare(
        "SELECT * FROM progress WHERE profile_id = ? ORDER BY created_at DESC LIMIT 20"
      )
      .all(profileId) as ProgressEntry[];

    // Streak days
    const allDays = db
      .prepare(
        "SELECT DISTINCT DATE(created_at) as day FROM progress WHERE profile_id = ? ORDER BY day DESC"
      )
      .all(profileId) as { day: string }[];

    let streakDays = 0;
    if (allDays.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const firstDay = new Date(allDays[0].day);
      firstDay.setHours(0, 0, 0, 0);

      // Allow streak if last activity was today or yesterday
      const diffFromToday = Math.floor(
        (today.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffFromToday <= 1) {
        streakDays = 1;
        for (let i = 1; i < allDays.length; i++) {
          const prevDate = new Date(allDays[i - 1].day);
          const currDate = new Date(allDays[i].day);
          const diff = Math.floor(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diff === 1) {
            streakDays++;
          } else {
            break;
          }
        }
      }
    }

    // Stats by activity type
    const statsByType = db
      .prepare(
        `SELECT activity_type, 
                COUNT(*) as total, 
                SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) as correct,
                SUM(CASE WHEN result = 'helped' THEN 1 ELSE 0 END) as helped,
                SUM(CASE WHEN result = 'skipped' THEN 1 ELSE 0 END) as skipped
         FROM progress WHERE profile_id = ?
         GROUP BY activity_type
         ORDER BY total DESC`
      )
      .all(profileId);

    return NextResponse.json({
      totalGamesPlayed: totalGames.count,
      wordsPractised: wordsPractised.count,
      mathsPractised: mathsPractised.count,
      recentActivity,
      streakDays,
      statsByType,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activity_type, activity_ref, result } = body as {
      activity_type: string;
      activity_ref: string;
      result: string;
    };

    if (!activity_type || typeof activity_type !== "string") {
      return NextResponse.json(
        { error: "activity_type is required" },
        { status: 400 }
      );
    }

    if (!result || !["correct", "helped", "skipped"].includes(result)) {
      return NextResponse.json(
        { error: "result must be 'correct', 'helped', or 'skipped'" },
        { status: 400 }
      );
    }

    const db = getDb();
    const profileId = 1;

    const stmt = db.prepare(
      "INSERT INTO progress (profile_id, activity_type, activity_ref, result) VALUES (?, ?, ?, ?)"
    );
    const insertResult = stmt.run(
      profileId,
      activity_type,
      activity_ref || null,
      result
    );

    return NextResponse.json(
      { id: insertResult.lastInsertRowid, success: true },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to record progress" },
      { status: 500 }
    );
  }
}
