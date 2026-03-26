import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import path from 'path';
import fs from 'fs';

const TEST_DB_DIR = path.join(process.cwd(), 'data');
const TEST_DB_PATH = path.join(TEST_DB_DIR, 'test-spellbound.db');

// Set the test DB path before importing db module
process.env.SPELLBOUND_DB_PATH = TEST_DB_PATH;

// Dynamic import so env var is read at import time
let db: typeof import('../db');

beforeAll(async () => {
  // Ensure data directory exists
  if (!fs.existsSync(TEST_DB_DIR)) {
    fs.mkdirSync(TEST_DB_DIR, { recursive: true });
  }
  // Remove old test DB if present
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  if (fs.existsSync(TEST_DB_PATH + '-wal')) fs.unlinkSync(TEST_DB_PATH + '-wal');
  if (fs.existsSync(TEST_DB_PATH + '-shm')) fs.unlinkSync(TEST_DB_PATH + '-shm');

  db = await import('../db');
});

afterAll(() => {
  db._resetDb();
  // Clean up test database files
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  if (fs.existsSync(TEST_DB_PATH + '-wal')) fs.unlinkSync(TEST_DB_PATH + '-wal');
  if (fs.existsSync(TEST_DB_PATH + '-shm')) fs.unlinkSync(TEST_DB_PATH + '-shm');
  delete process.env.SPELLBOUND_DB_PATH;
});

describe('database initialization', () => {
  it('creates all tables', () => {
    const database = db.getDb();
    const tables = database
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toContain('profiles');
    expect(tableNames).toContain('spelling_lists');
    expect(tableNames).toContain('spelling_words');
    expect(tableNames).toContain('progress');
    expect(tableNames).toContain('achievements');
    expect(tableNames).toContain('settings');
  });

  it('seeds a default profile', () => {
    const profiles = db.getProfiles();
    expect(profiles.length).toBeGreaterThanOrEqual(1);
    const defaultProfile = profiles[0] as { name: string; avatar: string };
    expect(defaultProfile.name).toBe('Learner');
    expect(defaultProfile.avatar).toBe('sprout');
  });

  it('seeds a default admin password setting', () => {
    const password = db.getSetting('admin_password');
    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password!.startsWith('$2')).toBe(true); // bcrypt hash
  });
});

describe('profile operations', () => {
  it('creates a profile and retrieves it', () => {
    const id = db.createProfile('TestChild', 'flower');
    const profile = db.getProfile(Number(id)) as { name: string; avatar: string };
    expect(profile).toBeDefined();
    expect(profile.name).toBe('TestChild');
    expect(profile.avatar).toBe('flower');
  });

  it('creates a profile with default avatar', () => {
    const id = db.createProfile('DefaultAvatar');
    const profile = db.getProfile(Number(id)) as { name: string; avatar: string };
    expect(profile.avatar).toBe('sprout');
  });

  it('lists all profiles', () => {
    const profiles = db.getProfiles();
    expect(profiles.length).toBeGreaterThanOrEqual(1);
  });
});

describe('spelling list operations', () => {
  let listId: number;

  it('creates a spelling list', () => {
    const id = db.createSpellingList(1, 'Week 1 Words');
    listId = Number(id);
    expect(listId).toBeGreaterThan(0);
  });

  it('retrieves a spelling list by id', () => {
    const list = db.getSpellingList(listId) as { name: string; profile_id: number };
    expect(list).toBeDefined();
    expect(list.name).toBe('Week 1 Words');
    expect(list.profile_id).toBe(1);
  });

  it('lists spelling lists for a profile', () => {
    const lists = db.getSpellingLists(1);
    expect(lists.length).toBeGreaterThanOrEqual(1);
  });
});

describe('spelling word operations', () => {
  let listId: number;

  beforeEach(() => {
    const id = db.createSpellingList(1, 'Word Test List');
    listId = Number(id);
  });

  it('adds a word to a list', () => {
    const wordId = db.addWord(listId, 'apple', 'A fruit');
    expect(Number(wordId)).toBeGreaterThan(0);
  });

  it('retrieves words for a list', () => {
    db.addWord(listId, 'banana');
    db.addWord(listId, 'cherry', 'Red fruit');
    const words = db.getWordsForList(listId) as { word: string; hint: string | null }[];
    expect(words).toHaveLength(2);
    expect(words[0].word).toBe('banana');
    expect(words[1].word).toBe('cherry');
    expect(words[1].hint).toBe('Red fruit');
  });

  it('removes a word', () => {
    const wordId = Number(db.addWord(listId, 'delete-me'));
    db.removeWord(wordId);
    const words = db.getWordsForList(listId);
    expect(words).toHaveLength(0);
  });

  it('addWord stores hint as null when not provided', () => {
    db.addWord(listId, 'nohint');
    const words = db.getWordsForList(listId) as { hint: string | null }[];
    expect(words[0].hint).toBeNull();
  });
});

describe('setActiveList', () => {
  it('activates the target list and deactivates others', () => {
    const id1 = Number(db.createSpellingList(1, 'List A'));
    const id2 = Number(db.createSpellingList(1, 'List B'));

    db.setActiveList(1, id1);
    let list1 = db.getSpellingList(id1) as { is_active: number };
    let list2 = db.getSpellingList(id2) as { is_active: number };
    expect(list1.is_active).toBe(1);
    expect(list2.is_active).toBe(0);

    db.setActiveList(1, id2);
    list1 = db.getSpellingList(id1) as { is_active: number };
    list2 = db.getSpellingList(id2) as { is_active: number };
    expect(list1.is_active).toBe(0);
    expect(list2.is_active).toBe(1);
  });
});

describe('progress operations', () => {
  it('records and retrieves progress', () => {
    db.recordProgress(1, 'spelling_test', 'apple', 'correct');
    db.recordProgress(1, 'maths_quiz', '3x4', 'correct');

    const all = db.getProgress(1);
    expect(all.length).toBeGreaterThanOrEqual(2);
  });

  it('filters progress by activity type', () => {
    db.recordProgress(1, 'spelling_filter', 'word1', 'correct');
    db.recordProgress(1, 'maths_filter', '5x5', 'helped');

    const spelling = db.getProgress(1, 'spelling_filter') as { activity_type: string }[];
    expect(spelling.length).toBeGreaterThanOrEqual(1);
    for (const p of spelling) {
      expect(p.activity_type).toBe('spelling_filter');
    }
  });

  it('records progress with null activity_ref', () => {
    const result = db.recordProgress(1, 'general', null, 'skipped');
    expect(result.changes).toBe(1);
  });
});

describe('achievement operations', () => {
  it('unlocks an achievement', () => {
    db.unlockAchievement(1, 'test_achievement');
    const achievements = db.getAchievements(1) as { achievement_key: string }[];
    const found = achievements.find((a) => a.achievement_key === 'test_achievement');
    expect(found).toBeDefined();
  });

  it('does not duplicate achievements (UNIQUE constraint)', () => {
    db.unlockAchievement(1, 'unique_test');
    db.unlockAchievement(1, 'unique_test'); // Should not throw (INSERT OR IGNORE)
    const achievements = db.getAchievements(1) as { achievement_key: string }[];
    const matches = achievements.filter((a) => a.achievement_key === 'unique_test');
    expect(matches).toHaveLength(1);
  });

  it('retrieves achievements ordered by unlocked_at', () => {
    const achievements = db.getAchievements(1);
    expect(Array.isArray(achievements)).toBe(true);
  });
});

describe('settings operations', () => {
  it('gets and sets a setting', () => {
    db.setSetting('test_key', 'test_value');
    expect(db.getSetting('test_key')).toBe('test_value');
  });

  it('updates an existing setting (upsert)', () => {
    db.setSetting('upsert_key', 'value1');
    db.setSetting('upsert_key', 'value2');
    expect(db.getSetting('upsert_key')).toBe('value2');
  });

  it('returns undefined for non-existent key', () => {
    expect(db.getSetting('nonexistent_key_xyz')).toBeUndefined();
  });
});
