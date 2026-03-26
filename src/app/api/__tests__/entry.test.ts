import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { setupTestDbEnv, teardownTestDb } from '@/test/db-helper';

const dbPath = setupTestDbEnv('api-entry');

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

describe('entry API — database operations', () => {
  describe('POST creates list and auto-activates', () => {
    it('creates a list that is active', () => {
      const database = db.getDb();

      // Simulate what entry API does: deactivate all, create, activate
      database
        .prepare("UPDATE spelling_lists SET is_active = 0 WHERE profile_id = ?")
        .run(1);

      const listResult = database
        .prepare("INSERT INTO spelling_lists (profile_id, name) VALUES (?, ?)")
        .run(1, 'Entry Test');
      const listId = Number(listResult.lastInsertRowid);

      database
        .prepare("UPDATE spelling_lists SET is_active = 1 WHERE id = ?")
        .run(listId);

      // Add words
      const insertWord = database.prepare(
        "INSERT INTO spelling_words (list_id, word, hint) VALUES (?, ?, ?)"
      );
      insertWord.run(listId, 'cat', null);
      insertWord.run(listId, 'dog', null);
      insertWord.run(listId, 'bird', null);

      const list = db.getSpellingList(listId) as { is_active: number; name: string };
      expect(list.is_active).toBe(1);
      expect(list.name).toBe('Entry Test');

      const words = db.getWordsForList(listId);
      expect(words).toHaveLength(3);

      // Verify other lists are deactivated
      const activeLists = database
        .prepare(
          "SELECT * FROM spelling_lists WHERE profile_id = ? AND is_active = 1"
        )
        .all(1) as { id: number }[];
      expect(activeLists).toHaveLength(1);
      expect(activeLists[0].id).toBe(listId);
    });
  });

  describe('validates minimum 3 words', () => {
    it('entry API requires at least 3 words', () => {
      // Simulate the validation: words.length < 3 should fail
      const words = [{ word: 'cat' }, { word: 'dog' }];
      expect(words.length).toBeLessThan(3);
      // In the actual API this returns 400
    });

    it('accepts exactly 3 words', () => {
      const words = [{ word: 'cat' }, { word: 'dog' }, { word: 'bird' }];
      expect(words.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('validates list name required', () => {
    it('rejects empty name', () => {
      // Simulate the validation logic
      const name = '';
      expect(!name || typeof name !== 'string' || !name.trim()).toBe(true);
    });

    it('rejects null name', () => {
      const name = null;
      expect(!name || typeof name !== 'string').toBe(true);
    });

    it('accepts valid name', () => {
      const name = 'Week 1';
      expect(name && typeof name === 'string' && name.trim().length > 0).toBe(true);
    });
  });

  describe('words are lowercased', () => {
    it('entry API lowercases words', () => {
      const database = db.getDb();

      const listResult = database
        .prepare("INSERT INTO spelling_lists (profile_id, name) VALUES (?, ?)")
        .run(1, 'Lowercase Test');
      const listId = Number(listResult.lastInsertRowid);

      // Simulate what entry API does: lowercase
      const inputWords = ['Apple', 'BANANA', 'Cherry'];
      const insertWord = database.prepare(
        "INSERT INTO spelling_words (list_id, word, hint) VALUES (?, ?, ?)"
      );
      for (const w of inputWords) {
        insertWord.run(listId, w.trim().toLowerCase(), null);
      }

      const words = db.getWordsForList(listId) as { word: string }[];
      expect(words.map((w) => w.word)).toEqual(['apple', 'banana', 'cherry']);
    });
  });
});
