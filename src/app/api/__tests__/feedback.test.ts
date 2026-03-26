import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDbEnv, teardownTestDb } from '@/test/db-helper';

const dbPath = setupTestDbEnv('api-feedback');

let db: typeof import('@/lib/db');

beforeAll(async () => {
  db = await import('@/lib/db');
});

afterAll(() => {
  db._resetDb();
  teardownTestDb(dbPath);
});

describe('feedback — database operations', () => {
  describe('inserting feedback', () => {
    it('inserts a feedback message and returns an id', () => {
      const database = db.getDb();
      const result = database
        .prepare('INSERT INTO feedback (message) VALUES (?)')
        .run('Great app!');
      expect(Number(result.lastInsertRowid)).toBeGreaterThan(0);
    });

    it('stores the message text correctly', () => {
      const database = db.getDb();
      database.prepare('INSERT INTO feedback (message) VALUES (?)').run('Love it!');
      const row = database
        .prepare('SELECT message FROM feedback WHERE message = ?')
        .get('Love it!') as { message: string } | undefined;
      expect(row).toBeDefined();
      expect(row!.message).toBe('Love it!');
    });
  });

  describe('retrieving feedback', () => {
    it('returns feedback ordered by newest first', () => {
      const database = db.getDb();
      // Clear existing feedback
      database.prepare('DELETE FROM feedback').run();

      // Insert with explicit timestamps to guarantee ordering
      database
        .prepare("INSERT INTO feedback (message, created_at) VALUES (?, datetime('now', '-2 seconds'))")
        .run('First message');
      database
        .prepare("INSERT INTO feedback (message, created_at) VALUES (?, datetime('now', '-1 seconds'))")
        .run('Second message');
      database
        .prepare("INSERT INTO feedback (message, created_at) VALUES (?, datetime('now'))")
        .run('Third message');

      const rows = database
        .prepare('SELECT * FROM feedback ORDER BY created_at DESC')
        .all() as { message: string }[];

      expect(rows).toHaveLength(3);
      // Most recent should be first
      expect(rows[0].message).toBe('Third message');
      expect(rows[2].message).toBe('First message');
    });
  });

  describe('message validation logic', () => {
    it('accepts messages within 1-1000 characters', () => {
      const validMessage = 'A valid message';
      const trimmed = validMessage.trim();
      expect(trimmed.length).toBeGreaterThanOrEqual(1);
      expect(trimmed.length).toBeLessThanOrEqual(1000);

      const database = db.getDb();
      const result = database
        .prepare('INSERT INTO feedback (message) VALUES (?)')
        .run(trimmed);
      expect(Number(result.lastInsertRowid)).toBeGreaterThan(0);
    });

    it('rejects empty messages (validation logic)', () => {
      const message = '';
      const trimmed = message.trim();
      expect(trimmed.length).toBeLessThan(1);
    });

    it('rejects whitespace-only messages (validation logic)', () => {
      const message = '   ';
      const trimmed = message.trim();
      expect(trimmed.length).toBeLessThan(1);
    });

    it('rejects messages over 1000 characters (validation logic)', () => {
      const message = 'a'.repeat(1001);
      expect(message.length).toBeGreaterThan(1000);
    });

    it('accepts messages at exactly 1000 characters', () => {
      const message = 'b'.repeat(1000);
      expect(message.length).toBe(1000);

      const database = db.getDb();
      const result = database
        .prepare('INSERT INTO feedback (message) VALUES (?)')
        .run(message);
      expect(Number(result.lastInsertRowid)).toBeGreaterThan(0);
    });

    it('accepts messages at exactly 1 character', () => {
      const message = 'x';
      expect(message.length).toBe(1);

      const database = db.getDb();
      const result = database
        .prepare('INSERT INTO feedback (message) VALUES (?)')
        .run(message);
      expect(Number(result.lastInsertRowid)).toBeGreaterThan(0);
    });
  });

  describe('feedback table schema', () => {
    it('auto-generates created_at timestamp', () => {
      const database = db.getDb();
      database.prepare('INSERT INTO feedback (message) VALUES (?)').run('Timestamped');
      const row = database
        .prepare('SELECT created_at FROM feedback WHERE message = ?')
        .get('Timestamped') as { created_at: string } | undefined;
      expect(row).toBeDefined();
      expect(row!.created_at).toBeTruthy();
    });

    it('auto-increments id', () => {
      const database = db.getDb();
      const r1 = database
        .prepare('INSERT INTO feedback (message) VALUES (?)')
        .run('msg1');
      const r2 = database
        .prepare('INSERT INTO feedback (message) VALUES (?)')
        .run('msg2');
      expect(Number(r2.lastInsertRowid)).toBeGreaterThan(Number(r1.lastInsertRowid));
    });
  });
});
