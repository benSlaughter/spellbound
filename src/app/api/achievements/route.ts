import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { achievements, type PlayerStats } from "@/lib/achievements";
import { checkCSRF } from "@/lib/auth";

interface AchievementRow {
  id: number;
  profile_id: number;
  achievement_key: string;
  unlocked_at: string;
}

function calculatePlayerStats(
  db: ReturnType<typeof getDb>,
  profileId: number
): PlayerStats {
  const totalGames = db
    .prepare("SELECT COUNT(*) as count FROM progress WHERE profile_id = ?")
    .get(profileId) as { count: number };

  const totalWordsCorrect = db
    .prepare(
      "SELECT COUNT(*) as count FROM progress WHERE profile_id = ? AND activity_type LIKE 'spelling_%' AND result = 'correct'"
    )
    .get(profileId) as { count: number };

  const totalMathsCorrect = db
    .prepare(
      "SELECT COUNT(*) as count FROM progress WHERE profile_id = ? AND activity_type LIKE 'maths_%' AND result = 'correct'"
    )
    .get(profileId) as { count: number };

  const uniqueTables = db
    .prepare(
      "SELECT COUNT(DISTINCT activity_ref) as count FROM progress WHERE profile_id = ? AND activity_type LIKE 'maths_%'"
    )
    .get(profileId) as { count: number };

  // Count spelling lists where all words have been practised correctly
  const completedLists = db
    .prepare(
      `SELECT COUNT(*) as count FROM spelling_lists sl
       WHERE sl.profile_id = ? AND sl.archived = 0
       AND NOT EXISTS (
         SELECT 1 FROM spelling_words sw
         WHERE sw.list_id = sl.id
         AND sw.word NOT IN (
           SELECT activity_ref FROM progress
           WHERE profile_id = ? AND activity_type LIKE 'spelling_%' AND result = 'correct'
         )
       )
       AND EXISTS (SELECT 1 FROM spelling_words WHERE list_id = sl.id)`
    )
    .get(profileId, profileId) as { count: number };

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

  const uniqueGameTypes = db
    .prepare(
      "SELECT COUNT(DISTINCT activity_type) as count FROM progress WHERE profile_id = ?"
    )
    .get(profileId) as { count: number };

  const totalAchievements = db
    .prepare(
      "SELECT COUNT(*) as count FROM achievements WHERE profile_id = ?"
    )
    .get(profileId) as { count: number };

  return {
    totalGamesPlayed: totalGames.count,
    totalWordsCorrect: totalWordsCorrect.count,
    totalMathsCorrect: totalMathsCorrect.count,
    uniqueTablesPlayed: uniqueTables.count,
    spellingListsCompleted: completedLists.count,
    streakDays,
    uniqueGameTypesPlayed: uniqueGameTypes.count,
    totalAchievements: totalAchievements.count,
  };
}

export async function GET() {
  try {
    const db = getDb();
    const profileId = 1;

    const unlocked = db
      .prepare(
        "SELECT * FROM achievements WHERE profile_id = ? ORDER BY unlocked_at"
      )
      .all(profileId) as AchievementRow[];

    const unlockedKeys = new Set(unlocked.map((a) => a.achievement_key));

    const allAchievements = achievements.map((a) => {
      const unlockedEntry = unlocked.find(
        (u) => u.achievement_key === a.key
      );
      return {
        key: a.key,
        title: a.title,
        description: a.description,
        emoji: a.emoji,
        unlocked: unlockedKeys.has(a.key),
        unlocked_at: unlockedEntry?.unlocked_at || null,
      };
    });

    return NextResponse.json(allAchievements);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkCSRF(request)) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 403 }
      );
    }

    const db = getDb();
    const profileId = 1;

    const stats = calculatePlayerStats(db, profileId);

    const unlocked = db
      .prepare(
        "SELECT achievement_key FROM achievements WHERE profile_id = ?"
      )
      .all(profileId) as { achievement_key: string }[];

    const unlockedKeys = new Set(unlocked.map((a) => a.achievement_key));

    const newlyUnlocked: Array<{
      key: string;
      title: string;
      description: string;
      emoji: string;
    }> = [];

    const insertAchievement = db.prepare(
      "INSERT OR IGNORE INTO achievements (profile_id, achievement_key) VALUES (?, ?)"
    );

    for (const achievement of achievements) {
      if (!unlockedKeys.has(achievement.key) && achievement.check(stats)) {
        insertAchievement.run(profileId, achievement.key);
        newlyUnlocked.push({
          key: achievement.key,
          title: achievement.title,
          description: achievement.description,
          emoji: achievement.emoji,
        });
      }
    }

    return NextResponse.json({ newlyUnlocked });
  } catch {
    return NextResponse.json(
      { error: "Failed to check achievements" },
      { status: 500 }
    );
  }
}
