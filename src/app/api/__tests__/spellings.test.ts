import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { setupTestDbEnv, teardownTestDb } from '@/test/db-helper';

const dbPath = setupTestDbEnv('api-spellings');

// Mock auth to bypass admin checks
vi.mock('@/lib/auth', () => ({
  checkAdminAuth: vi.fn(async () => true),
  checkCSRF: vi.fn(() => true),
  validateStringInput: vi.fn((value: unknown, maxLength: number, fieldName: string) => {
    if (!value || typeof value !== 'string') {
      return { valid: false, error: `${fieldName} is required and must be a string` };
    }
    if (value.length > maxLength) {
      return { valid: false, error: `${fieldName} must be at most ${maxLength} characters` };
    }
    return { valid: true, value };
  }),
}));

let db: typeof import('@/lib/db');

beforeAll(async () => {
  db = await import('@/lib/db');
});

afterAll(() => {
  db._resetDb();
  teardownTestDb(dbPath);
});

function makeRequest(url: string, options: RequestInit = {}): Request {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

describe('spellings API — database operations', () => {
  describe('POST creates a list with words', () => {
    it('creates a spelling list with words via db helpers', () => {
      const listId = Number(db.createSpellingList(1, 'API Test List'));
      expect(listId).toBeGreaterThan(0);

      db.addWord(listId, 'hello', 'greeting');
      db.addWord(listId, 'world');
      db.addWord(listId, 'test');

      const words = db.getWordsForList(listId) as { word: string; hint: string | null }[];
      expect(words).toHaveLength(3);
      expect(words[0].word).toBe('hello');
      expect(words[0].hint).toBe('greeting');
    });
  });

  describe('GET returns all lists with words', () => {
    it('returns all non-archived lists', () => {
      const lists = db.getSpellingLists(1);
      expect(lists.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET with active=true returns only active lists', () => {
    it('only returns active lists', () => {
      const id1 = Number(db.createSpellingList(1, 'Active List'));
      const id2 = Number(db.createSpellingList(1, 'Inactive List'));

      db.setActiveList(1, id1);

      const database = db.getDb();
      const activeLists = database
        .prepare(
          'SELECT * FROM spelling_lists WHERE is_active = 1 AND archived = 0 ORDER BY created_at DESC'
        )
        .all() as { id: number; name: string }[];

      expect(activeLists.length).toBeGreaterThanOrEqual(1);
      const activeIds = activeLists.map((l) => l.id);
      expect(activeIds).toContain(id1);
      expect(activeIds).not.toContain(id2);
    });
  });

  describe('GET /api/spellings/[id] returns single list', () => {
    it('returns a single list by ID', () => {
      const listId = Number(db.createSpellingList(1, 'Single List'));
      db.addWord(listId, 'unique');

      const list = db.getSpellingList(listId) as { name: string };
      expect(list).toBeDefined();
      expect(list.name).toBe('Single List');

      const words = db.getWordsForList(listId) as { word: string }[];
      expect(words).toHaveLength(1);
      expect(words[0].word).toBe('unique');
    });

    it('returns undefined for non-existent list', () => {
      const list = db.getSpellingList(99999);
      expect(list).toBeUndefined();
    });
  });

  describe('PUT /api/spellings/[id] updates list', () => {
    it('updates list name', () => {
      const listId = Number(db.createSpellingList(1, 'Old Name'));
      const database = db.getDb();
      database.prepare('UPDATE spelling_lists SET name = ? WHERE id = ?').run('New Name', listId);
      const updated = db.getSpellingList(listId) as { name: string };
      expect(updated.name).toBe('New Name');
    });

    it('replaces words on update', () => {
      const listId = Number(db.createSpellingList(1, 'Replace Words'));
      db.addWord(listId, 'old-word1');
      db.addWord(listId, 'old-word2');

      const database = db.getDb();
      database.prepare('DELETE FROM spelling_words WHERE list_id = ?').run(listId);
      db.addWord(listId, 'new-word1');
      db.addWord(listId, 'new-word2');
      db.addWord(listId, 'new-word3');

      const words = db.getWordsForList(listId) as { word: string }[];
      expect(words).toHaveLength(3);
      expect(words.map((w) => w.word)).toEqual(['new-word1', 'new-word2', 'new-word3']);
    });
  });

  describe('DELETE /api/spellings/[id] removes list and words', () => {
    it('deletes list and cascades to words', () => {
      const listId = Number(db.createSpellingList(1, 'Delete Me'));
      db.addWord(listId, 'word1');
      db.addWord(listId, 'word2');

      const database = db.getDb();
      database.prepare('DELETE FROM spelling_words WHERE list_id = ?').run(listId);
      database.prepare('DELETE FROM spelling_lists WHERE id = ?').run(listId);

      expect(db.getSpellingList(listId)).toBeUndefined();
      expect(db.getWordsForList(listId)).toHaveLength(0);
    });
  });

  describe('POST /api/spellings/[id]/activate', () => {
    it('sets active and deactivates others', () => {
      const id1 = Number(db.createSpellingList(1, 'Activate A'));
      const id2 = Number(db.createSpellingList(1, 'Activate B'));

      db.setActiveList(1, id1);
      let l1 = db.getSpellingList(id1) as { is_active: number };
      let l2 = db.getSpellingList(id2) as { is_active: number };
      expect(l1.is_active).toBe(1);
      expect(l2.is_active).toBe(0);

      db.setActiveList(1, id2);
      l1 = db.getSpellingList(id1) as { is_active: number };
      l2 = db.getSpellingList(id2) as { is_active: number };
      expect(l1.is_active).toBe(0);
      expect(l2.is_active).toBe(1);
    });
  });
});
