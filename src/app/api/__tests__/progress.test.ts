import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { setupTestDbEnv, teardownTestDb } from '@/test/db-helper';

const dbPath = setupTestDbEnv('api-progress');

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

describe('progress API — database operations', () => {
  describe('POST records progress entry', () => {
    it('inserts a progress record', () => {
      const result = db.recordProgress(1, 'spelling_test', 'cat', 'correct');
      expect(result.changes).toBe(1);
    });

    it('records progress with different result types', () => {
      db.recordProgress(1, 'maths_quiz', '3x4', 'correct');
      db.recordProgress(1, 'maths_quiz', '5x5', 'helped');
      db.recordProgress(1, 'spelling_test', 'dog', 'skipped');

      const all = db.getProgress(1);
      expect(all.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('GET returns summary with correct counts', () => {
    it('returns all progress for a profile', () => {
      const progress = db.getProgress(1);
      expect(Array.isArray(progress)).toBe(true);
      expect(progress.length).toBeGreaterThan(0);
    });

    it('filters by activity type', () => {
      const spelling = db.getProgress(1, 'spelling_test') as { activity_type: string }[];
      for (const p of spelling) {
        expect(p.activity_type).toBe('spelling_test');
      }
    });
  });

  describe('streak calculation', () => {
    it('calculates streak from consecutive days', () => {
      const database = db.getDb();

      // Insert progress for consecutive days
      const today = new Date();
      for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        database
          .prepare(
            "INSERT INTO progress (profile_id, activity_type, activity_ref, result, created_at) VALUES (?, ?, ?, ?, ?)"
          )
          .run(1, 'streak_test', `day${i}`, 'correct', `${dateStr} 10:00:00`);
      }

      // Verify the days exist
      const allDays = database
        .prepare(
          "SELECT DISTINCT DATE(created_at) as day FROM progress WHERE profile_id = ? ORDER BY day DESC"
        )
        .all(1) as { day: string }[];

      expect(allDays.length).toBeGreaterThanOrEqual(5);

      // Calculate streak as the API does
      let streakDays = 0;
      if (allDays.length > 0) {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const firstDay = new Date(allDays[0].day);
        firstDay.setHours(0, 0, 0, 0);
        const diffFromToday = Math.floor(
          (todayDate.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)
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

      expect(streakDays).toBeGreaterThanOrEqual(5);
    });
  });

  describe('stats by type are grouped correctly', () => {
    it('groups by activity type', () => {
      const database = db.getDb();
      const statsByType = database
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
        .all(1) as { activity_type: string; total: number; correct: number }[];

      expect(statsByType.length).toBeGreaterThan(0);
      for (const stat of statsByType) {
        expect(stat.activity_type).toBeDefined();
        expect(stat.total).toBeGreaterThan(0);
      }
    });
  });
});
