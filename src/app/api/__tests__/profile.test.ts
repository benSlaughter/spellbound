import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { setupTestDbEnv, teardownTestDb } from '@/test/db-helper';

const dbPath = setupTestDbEnv('api-profile');

vi.mock('@/lib/auth', () => ({
  checkAdminAuth: vi.fn(async () => true),
  checkCSRF: vi.fn(() => true),
  validateStringInput: vi.fn((val: string, _max: number, _label: string) => ({
    valid: !!val?.trim(),
    value: val?.trim() || '',
    error: val?.trim() ? undefined : 'Name is required',
  })),
}));

let db: typeof import('@/lib/db');

beforeAll(async () => {
  db = await import('@/lib/db');
});

afterAll(() => {
  db._resetDb();
  teardownTestDb(dbPath);
});

describe('profile API — database operations', () => {
  describe('GET profile', () => {
    it('returns the default profile', () => {
      const profile = db.getProfile(1) as { id: number; name: string; avatar: string };
      expect(profile).toBeDefined();
      expect(profile.name).toBe('Learner');
      expect(profile.avatar).toBe('sprout');
    });
  });

  describe('PUT profile — update name', () => {
    it('updates the profile name', () => {
      db.updateProfileName(1, 'Rosie');
      const profile = db.getProfile(1) as { id: number; name: string };
      expect(profile.name).toBe('Rosie');
    });

    it('preserves other profile fields when updating name', () => {
      db.updateProfileName(1, 'Charlie');
      const profile = db.getProfile(1) as { id: number; name: string; avatar: string };
      expect(profile.name).toBe('Charlie');
      expect(profile.avatar).toBe('sprout');
    });

    it('handles empty name gracefully at DB level', () => {
      // DB allows empty string — validation should be at API layer
      db.updateProfileName(1, '');
      const profile = db.getProfile(1) as { id: number; name: string };
      expect(profile.name).toBe('');
      // Reset
      db.updateProfileName(1, 'Learner');
    });
  });

  describe('profile not found', () => {
    it('returns undefined for non-existent profile', () => {
      const profile = db.getProfile(999);
      expect(profile).toBeUndefined();
    });
  });

  describe('duplicate word prevention', () => {
    it('ignores duplicate words in the same list', () => {
      const listId = Number(db.createSpellingList(1, 'Test List'));
      db.addWord(listId, 'hello', 'a greeting');
      db.addWord(listId, 'hello', 'a greeting again');
      const words = db.getWordsForList(listId) as { word: string }[];
      const hellos = words.filter(w => w.word === 'hello');
      expect(hellos).toHaveLength(1);
    });

    it('allows same word in different lists', () => {
      const list1 = Number(db.createSpellingList(1, 'List A'));
      const list2 = Number(db.createSpellingList(1, 'List B'));
      db.addWord(list1, 'world', 'the planet');
      db.addWord(list2, 'world', 'the planet');
      const words1 = db.getWordsForList(list1) as { word: string }[];
      const words2 = db.getWordsForList(list2) as { word: string }[];
      expect(words1.filter(w => w.word === 'world')).toHaveLength(1);
      expect(words2.filter(w => w.word === 'world')).toHaveLength(1);
    });
  });
});
