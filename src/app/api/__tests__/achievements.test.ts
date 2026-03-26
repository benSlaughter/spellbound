import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { setupTestDbEnv, teardownTestDb } from '@/test/db-helper';
import { achievements, type PlayerStats } from '@/lib/achievements';

const dbPath = setupTestDbEnv('api-achievements');

vi.mock('@/lib/auth', () => ({
  checkAdminAuth: vi.fn(async () => true),
  checkCSRF: vi.fn(() => true),
}));

let db: typeof import('@/lib/db');

beforeAll(async () => {
  db = await import('@/lib/db');
});

afterAll(() => {
  db._resetDb();
  teardownTestDb(dbPath);
});

describe('achievements API — database operations', () => {
  describe('POST checks and unlocks new achievements', () => {
    it('unlocks first_sprout after a game is played', () => {
      // Record a game to make totalGamesPlayed >= 1
      db.recordProgress(1, 'maths_quiz', '2x3', 'correct');

      // Calculate stats as the API would
      const database = db.getDb();
      const totalGames = database
        .prepare("SELECT COUNT(*) as count FROM progress WHERE profile_id = ?")
        .get(1) as { count: number };

      const stats: PlayerStats = {
        totalGamesPlayed: totalGames.count,
        totalWordsCorrect: 0,
        totalMathsCorrect: 0,
        uniqueTablesPlayed: 0,
        spellingListsCompleted: 0,
        streakDays: 0,
        uniqueGameTypesPlayed: 0,
        totalAchievements: 0,
      };

      // Check which achievements should unlock
      const unlocked = database
        .prepare("SELECT achievement_key FROM achievements WHERE profile_id = ?")
        .all(1) as { achievement_key: string }[];
      const unlockedKeys = new Set(unlocked.map((a) => a.achievement_key));

      const newlyUnlocked: string[] = [];
      for (const achievement of achievements) {
        if (!unlockedKeys.has(achievement.key) && achievement.check(stats)) {
          db.unlockAchievement(1, achievement.key);
          newlyUnlocked.push(achievement.key);
        }
      }

      expect(newlyUnlocked).toContain('first_sprout');
    });
  });

  describe('already-unlocked achievements are not re-unlocked', () => {
    it('INSERT OR IGNORE prevents duplicates', () => {
      db.unlockAchievement(1, 'test_dup');
      db.unlockAchievement(1, 'test_dup');

      const all = db.getAchievements(1) as { achievement_key: string }[];
      const matches = all.filter((a) => a.achievement_key === 'test_dup');
      expect(matches).toHaveLength(1);
    });
  });

  describe('returns newly unlocked achievements', () => {
    it('finds new achievements that meet criteria', () => {
      const database = db.getDb();

      // Insert enough maths correct to trigger maths_maestro
      for (let i = 0; i < 50; i++) {
        db.recordProgress(1, 'maths_quiz', `q${i}`, 'correct');
      }

      const totalMathsCorrect = database
        .prepare(
          "SELECT COUNT(*) as count FROM progress WHERE profile_id = ? AND activity_type LIKE 'maths_%' AND result = 'correct'"
        )
        .get(1) as { count: number };

      expect(totalMathsCorrect.count).toBeGreaterThanOrEqual(50);

      const stats: PlayerStats = {
        totalGamesPlayed: totalMathsCorrect.count,
        totalWordsCorrect: 0,
        totalMathsCorrect: totalMathsCorrect.count,
        uniqueTablesPlayed: 0,
        spellingListsCompleted: 0,
        streakDays: 0,
        uniqueGameTypesPlayed: 0,
        totalAchievements: 0,
      };

      // Get already unlocked
      const unlocked = database
        .prepare("SELECT achievement_key FROM achievements WHERE profile_id = ?")
        .all(1) as { achievement_key: string }[];
      const unlockedKeys = new Set(unlocked.map((a) => a.achievement_key));

      const newlyUnlocked: string[] = [];
      for (const achievement of achievements) {
        if (!unlockedKeys.has(achievement.key) && achievement.check(stats)) {
          db.unlockAchievement(1, achievement.key);
          newlyUnlocked.push(achievement.key);
        }
      }

      expect(newlyUnlocked).toContain('maths_maestro');
    });
  });
});
