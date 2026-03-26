import { describe, it, expect } from 'vitest';
import { achievements, type PlayerStats } from '../achievements';

function makeStats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return {
    totalGamesPlayed: 0,
    totalWordsCorrect: 0,
    totalMathsCorrect: 0,
    uniqueTablesPlayed: 0,
    spellingListsCompleted: 0,
    streakDays: 0,
    uniqueGameTypesPlayed: 0,
    totalAchievements: 0,
    ...overrides,
  };
}

describe('achievements', () => {
  it('all achievements have required fields', () => {
    for (const a of achievements) {
      expect(a.key).toBeDefined();
      expect(typeof a.key).toBe('string');
      expect(a.title).toBeDefined();
      expect(typeof a.title).toBe('string');
      expect(a.description).toBeDefined();
      expect(typeof a.description).toBe('string');
      expect(a.emoji).toBeDefined();
      expect(typeof a.emoji).toBe('string');
      expect(typeof a.check).toBe('function');
    }
  });

  it('all achievement keys are unique', () => {
    const keys = achievements.map((a) => a.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  describe('first_sprout', () => {
    const achievement = achievements.find((a) => a.key === 'first_sprout')!;

    it('is unlocked when totalGamesPlayed >= 1', () => {
      expect(achievement.check(makeStats({ totalGamesPlayed: 1 }))).toBe(true);
    });

    it('is locked when totalGamesPlayed < 1', () => {
      expect(achievement.check(makeStats({ totalGamesPlayed: 0 }))).toBe(false);
    });

    it('is unlocked when totalGamesPlayed is above threshold', () => {
      expect(achievement.check(makeStats({ totalGamesPlayed: 10 }))).toBe(true);
    });
  });

  describe('word_wizard', () => {
    const achievement = achievements.find((a) => a.key === 'word_wizard')!;

    it('is unlocked when spellingListsCompleted >= 1', () => {
      expect(achievement.check(makeStats({ spellingListsCompleted: 1 }))).toBe(true);
    });

    it('is locked when spellingListsCompleted < 1', () => {
      expect(achievement.check(makeStats({ spellingListsCompleted: 0 }))).toBe(false);
    });

    it('is unlocked above threshold', () => {
      expect(achievement.check(makeStats({ spellingListsCompleted: 5 }))).toBe(true);
    });
  });

  describe('super_speller', () => {
    const achievement = achievements.find((a) => a.key === 'super_speller')!;

    it('is unlocked at threshold (50)', () => {
      expect(achievement.check(makeStats({ totalWordsCorrect: 50 }))).toBe(true);
    });

    it('is locked below threshold', () => {
      expect(achievement.check(makeStats({ totalWordsCorrect: 49 }))).toBe(false);
    });

    it('is unlocked above threshold', () => {
      expect(achievement.check(makeStats({ totalWordsCorrect: 100 }))).toBe(true);
    });
  });

  describe('number_explorer', () => {
    const achievement = achievements.find((a) => a.key === 'number_explorer')!;

    it('is unlocked at threshold (12)', () => {
      expect(achievement.check(makeStats({ uniqueTablesPlayed: 12 }))).toBe(true);
    });

    it('is locked below threshold', () => {
      expect(achievement.check(makeStats({ uniqueTablesPlayed: 11 }))).toBe(false);
    });

    it('is unlocked above threshold', () => {
      expect(achievement.check(makeStats({ uniqueTablesPlayed: 15 }))).toBe(true);
    });
  });

  describe('shining_star', () => {
    const achievement = achievements.find((a) => a.key === 'shining_star')!;

    it('is unlocked at threshold (5 days)', () => {
      expect(achievement.check(makeStats({ streakDays: 5 }))).toBe(true);
    });

    it('is locked below threshold', () => {
      expect(achievement.check(makeStats({ streakDays: 4 }))).toBe(false);
    });

    it('is unlocked above threshold', () => {
      expect(achievement.check(makeStats({ streakDays: 30 }))).toBe(true);
    });
  });

  describe('century', () => {
    const achievement = achievements.find((a) => a.key === 'century')!;

    it('is unlocked when words + maths >= 100', () => {
      expect(
        achievement.check(makeStats({ totalWordsCorrect: 50, totalMathsCorrect: 50 }))
      ).toBe(true);
    });

    it('is locked when words + maths < 100', () => {
      expect(
        achievement.check(makeStats({ totalWordsCorrect: 40, totalMathsCorrect: 59 }))
      ).toBe(false);
    });

    it('is unlocked with just words', () => {
      expect(
        achievement.check(makeStats({ totalWordsCorrect: 100, totalMathsCorrect: 0 }))
      ).toBe(true);
    });

    it('is unlocked with just maths', () => {
      expect(
        achievement.check(makeStats({ totalWordsCorrect: 0, totalMathsCorrect: 100 }))
      ).toBe(true);
    });
  });

  describe('maths_maestro', () => {
    const achievement = achievements.find((a) => a.key === 'maths_maestro')!;

    it('is unlocked at threshold (50)', () => {
      expect(achievement.check(makeStats({ totalMathsCorrect: 50 }))).toBe(true);
    });

    it('is locked below threshold', () => {
      expect(achievement.check(makeStats({ totalMathsCorrect: 49 }))).toBe(false);
    });

    it('is unlocked above threshold', () => {
      expect(achievement.check(makeStats({ totalMathsCorrect: 200 }))).toBe(true);
    });
  });

  describe('dedicated_learner', () => {
    const achievement = achievements.find((a) => a.key === 'dedicated_learner')!;

    it('is unlocked at threshold (10 days)', () => {
      expect(achievement.check(makeStats({ streakDays: 10 }))).toBe(true);
    });

    it('is locked below threshold', () => {
      expect(achievement.check(makeStats({ streakDays: 9 }))).toBe(false);
    });

    it('is unlocked above threshold', () => {
      expect(achievement.check(makeStats({ streakDays: 20 }))).toBe(true);
    });
  });

  describe('butterfly_garden', () => {
    const achievement = achievements.find((a) => a.key === 'butterfly_garden')!;

    it('is unlocked at threshold (10 achievements)', () => {
      expect(achievement.check(makeStats({ totalAchievements: 10 }))).toBe(true);
    });

    it('is locked below threshold', () => {
      expect(achievement.check(makeStats({ totalAchievements: 9 }))).toBe(false);
    });
  });

  describe('rainbow_learner', () => {
    const achievement = achievements.find((a) => a.key === 'rainbow_learner')!;

    it('is unlocked at threshold (10 game types)', () => {
      expect(achievement.check(makeStats({ uniqueGameTypesPlayed: 10 }))).toBe(true);
    });

    it('is locked below threshold', () => {
      expect(achievement.check(makeStats({ uniqueGameTypesPlayed: 9 }))).toBe(false);
    });
  });
});
