import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDbEnv, teardownTestDb } from '@/test/db-helper';

const dbPath = setupTestDbEnv('api-maths-tables');

let db: typeof import('@/lib/db');

const ALL_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const ALL_DIFFICULTIES = ['seedling', 'sapling', 'tree', 'mighty_oak'];

beforeAll(async () => {
  db = await import('@/lib/db');
});

afterAll(() => {
  db._resetDb();
  teardownTestDb(dbPath);
});

function parseTables(value: string | undefined): number[] {
  if (!value) return ALL_TABLES;
  const parsed = value
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 12);
  return parsed.length > 0 ? parsed : ALL_TABLES;
}

function parseDifficulties(value: string | undefined): string[] {
  if (!value) return ALL_DIFFICULTIES;
  const parsed = value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => ALL_DIFFICULTIES.includes(s));
  return parsed.length > 0 ? parsed : ALL_DIFFICULTIES;
}

describe('maths tables — database operations', () => {
  describe('default tables', () => {
    it('returns all tables 1-12 by default', () => {
      const value = db.getSetting('maths_tables');
      const tables = parseTables(value);
      expect(tables).toEqual(ALL_TABLES);
    });
  });

  describe('custom tables', () => {
    it('stores and retrieves custom tables', () => {
      db.setSetting('maths_tables', '2,5,10');
      const value = db.getSetting('maths_tables');
      const tables = parseTables(value);
      expect(tables).toEqual([2, 5, 10]);
    });

    it('reads back the updated tables correctly', () => {
      db.setSetting('maths_tables', '3,7');
      const tables = parseTables(db.getSetting('maths_tables'));
      expect(tables).toEqual([3, 7]);
    });

    it('restores defaults when resetting', () => {
      db.setSetting('maths_tables', '1,2,3,4,5,6,7,8,9,10,11,12');
      const tables = parseTables(db.getSetting('maths_tables'));
      expect(tables).toEqual(ALL_TABLES);
    });
  });

  describe('default difficulties', () => {
    it('returns all 4 difficulties by default', () => {
      const value = db.getSetting('maths_difficulties');
      const diffs = parseDifficulties(value);
      expect(diffs).toEqual(ALL_DIFFICULTIES);
    });
  });

  describe('custom difficulties', () => {
    it('stores and retrieves custom difficulties', () => {
      db.setSetting('maths_difficulties', 'seedling,tree');
      const diffs = parseDifficulties(db.getSetting('maths_difficulties'));
      expect(diffs).toEqual(['seedling', 'tree']);
    });

    it('reads back updated difficulties correctly', () => {
      db.setSetting('maths_difficulties', 'mighty_oak');
      const diffs = parseDifficulties(db.getSetting('maths_difficulties'));
      expect(diffs).toEqual(['mighty_oak']);
    });
  });

  describe('invalid values are filtered', () => {
    it('filters out-of-range table numbers', () => {
      db.setSetting('maths_tables', '0,5,13,99,-1,10');
      const tables = parseTables(db.getSetting('maths_tables'));
      expect(tables).toEqual([5, 10]);
    });

    it('filters non-numeric table values', () => {
      db.setSetting('maths_tables', 'abc,3,def,7');
      const tables = parseTables(db.getSetting('maths_tables'));
      expect(tables).toEqual([3, 7]);
    });

    it('falls back to all tables when all values are invalid', () => {
      db.setSetting('maths_tables', 'abc,0,13');
      const tables = parseTables(db.getSetting('maths_tables'));
      expect(tables).toEqual(ALL_TABLES);
    });

    it('filters invalid difficulty names', () => {
      db.setSetting('maths_difficulties', 'seedling,invalid,tree,unknown');
      const diffs = parseDifficulties(db.getSetting('maths_difficulties'));
      expect(diffs).toEqual(['seedling', 'tree']);
    });

    it('falls back to all difficulties when all values are invalid', () => {
      db.setSetting('maths_difficulties', 'bad,wrong');
      const diffs = parseDifficulties(db.getSetting('maths_difficulties'));
      expect(diffs).toEqual(ALL_DIFFICULTIES);
    });
  });
});
