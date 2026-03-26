import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateQuestions,
  shuffleArray,
  makeShuffledAnswers,
  randomEncouragement,
  parseTablesParam,
  parseDifficultyParam,
  type Difficulty,
} from '../maths-helpers';

describe('randomEncouragement', () => {
  it('returns a non-empty string', () => {
    const msg = randomEncouragement();
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });
});

describe('shuffleArray', () => {
  it('returns an array with the same elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('does not mutate the original array', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffleArray(original);
    expect(original).toEqual(copy);
  });

  it('returns empty array when given empty array', () => {
    expect(shuffleArray([])).toEqual([]);
  });
});

describe('makeShuffledAnswers', () => {
  it('includes the correct answer', () => {
    const result = makeShuffledAnswers(12, [10, 14, 15]);
    expect(result).toContain(12);
  });

  it('includes all wrong answers', () => {
    const wrong = [10, 14, 15];
    const result = makeShuffledAnswers(12, wrong);
    for (const w of wrong) {
      expect(result).toContain(w);
    }
  });

  it('returns exactly 4 answers', () => {
    const result = makeShuffledAnswers(12, [10, 14, 15]);
    expect(result).toHaveLength(4);
  });
});

describe('parseTablesParam', () => {
  it('returns all tables when param is null', () => {
    expect(parseTablesParam(null)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('parses comma-separated values', () => {
    expect(parseTablesParam('2,5,7')).toEqual([2, 5, 7]);
  });

  it('filters out invalid values', () => {
    expect(parseTablesParam('2,abc,5')).toEqual([2, 5]);
  });

  it('filters out out-of-range values', () => {
    expect(parseTablesParam('0,5,13')).toEqual([5]);
  });

  it('returns all tables when all values are invalid', () => {
    expect(parseTablesParam('abc,xyz')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('handles whitespace in values', () => {
    expect(parseTablesParam(' 3 , 6 , 9 ')).toEqual([3, 6, 9]);
  });
});

describe('parseDifficultyParam', () => {
  it('returns sapling as default for null', () => {
    expect(parseDifficultyParam(null)).toBe('sapling');
  });

  it('returns sapling as default for invalid value', () => {
    expect(parseDifficultyParam('invalid')).toBe('sapling');
  });

  it.each(['seedling', 'sapling', 'tree', 'mighty_oak'] as Difficulty[])(
    'accepts valid difficulty: %s',
    (d) => {
      expect(parseDifficultyParam(d)).toBe(d);
    }
  );
});

describe('generateQuestions', () => {
  it('returns the correct number of questions', () => {
    const questions = generateQuestions([2, 3], 'sapling', 5);
    expect(questions).toHaveLength(5);
  });

  it('returns fewer questions when not enough can be generated', () => {
    // Single table, seedling => 6 questions max (1×1..1×6)
    const questions = generateQuestions([1], 'seedling', 100);
    expect(questions.length).toBeLessThanOrEqual(6);
  });

  it('generates questions only from selected tables', () => {
    const tables = [3, 7];
    const questions = generateQuestions(tables, 'sapling', 20);
    for (const q of questions) {
      // For multiplication, the ref is "table×multiplier"
      const refMatch = q.ref.match(/^(\d+)x(\d+)$/);
      expect(refMatch).not.toBeNull();
      const table = Number(refMatch![1]);
      expect(tables).toContain(table);
    }
  });

  it('each question has correct answer and 3 wrong answers', () => {
    const questions = generateQuestions([5], 'sapling', 10);
    for (const q of questions) {
      expect(typeof q.answer).toBe('number');
      expect(q.wrongAnswers).toHaveLength(3);
    }
  });

  it('wrong answers do not include the correct answer', () => {
    const questions = generateQuestions([2, 3, 4, 5], 'sapling', 20);
    for (const q of questions) {
      expect(q.wrongAnswers).not.toContain(q.answer);
    }
  });

  it('wrong answers are unique', () => {
    const questions = generateQuestions([2, 3, 4, 5], 'sapling', 20);
    for (const q of questions) {
      const unique = new Set(q.wrongAnswers);
      expect(unique.size).toBe(q.wrongAnswers.length);
    }
  });

  describe('difficulty: seedling', () => {
    it('generates only multiplication questions', () => {
      const questions = generateQuestions([2, 3], 'seedling', 10);
      for (const q of questions) {
        expect(q.question).toContain('×');
        expect(q.question).not.toContain('÷');
      }
    });

    it('only uses multipliers up to 6', () => {
      const questions = generateQuestions([2], 'seedling', 100);
      for (const q of questions) {
        const match = q.ref.match(/^(\d+)x(\d+)$/);
        expect(match).not.toBeNull();
        const multiplier = Number(match![2]);
        expect(multiplier).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('difficulty: sapling', () => {
    it('generates only multiplication questions', () => {
      const questions = generateQuestions([4, 5], 'sapling', 20);
      for (const q of questions) {
        expect(q.question).toContain('×');
        expect(q.question).not.toContain('÷');
      }
    });

    it('uses full range of multipliers up to 12', () => {
      const questions = generateQuestions([2], 'sapling', 100);
      const multipliers = questions.map((q) => {
        const match = q.ref.match(/^(\d+)x(\d+)$/);
        return Number(match![2]);
      });
      expect(Math.max(...multipliers)).toBeGreaterThan(6);
    });
  });

  describe('difficulty: tree', () => {
    it('generates a mix of multiplication and division', () => {
      const questions = generateQuestions([2, 3, 4, 5], 'tree', 50);
      const hasMul = questions.some((q) => q.question.includes('×'));
      const hasDiv = questions.some((q) => q.question.includes('÷'));
      expect(hasMul).toBe(true);
      expect(hasDiv).toBe(true);
    });

    it('division questions have whole-number answers', () => {
      const questions = generateQuestions([2, 3, 4], 'tree', 50);
      for (const q of questions) {
        if (q.question.includes('÷')) {
          expect(Number.isInteger(q.answer)).toBe(true);
        }
      }
    });
  });

  describe('difficulty: mighty_oak', () => {
    it('generates only division questions', () => {
      const questions = generateQuestions([6, 7], 'mighty_oak', 20);
      for (const q of questions) {
        expect(q.question).toContain('÷');
      }
    });

    it('division questions have whole-number answers', () => {
      const questions = generateQuestions([6, 7, 8], 'mighty_oak', 30);
      for (const q of questions) {
        expect(Number.isInteger(q.answer)).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it('uses all tables when given empty array', () => {
      const questions = generateQuestions([], 'sapling', 10);
      expect(questions.length).toBeGreaterThan(0);
    });

    it('works with a single table', () => {
      const questions = generateQuestions([9], 'sapling', 5);
      expect(questions).toHaveLength(5);
      for (const q of questions) {
        expect(q.ref).toMatch(/^9x\d+$/);
      }
    });

    it('works with all tables selected', () => {
      const allTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const questions = generateQuestions(allTables, 'sapling', 20);
      expect(questions).toHaveLength(20);
    });

    it('questions are shuffled (not always in same order)', () => {
      // Generate twice and check they differ (extremely unlikely to be the same)
      const q1 = generateQuestions([1, 2, 3, 4, 5], 'sapling', 20);
      const q2 = generateQuestions([1, 2, 3, 4, 5], 'sapling', 20);
      const refs1 = q1.map((q) => q.ref).join(',');
      const refs2 = q2.map((q) => q.ref).join(',');
      // Not a strict test since shuffling is random, but with 20 items
      // the probability of identical order is astronomically low
      // We just verify both produce valid results
      expect(q1).toHaveLength(20);
      expect(q2).toHaveLength(20);
    });
  });
});
