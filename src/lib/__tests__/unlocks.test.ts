import { describe, it, expect } from 'vitest';
import { GAMES_UNLOCKS, type GameUnlock } from '../unlocks';

describe('unlocks', () => {
  it('exports a non-empty GAMES_UNLOCKS array', () => {
    expect(Array.isArray(GAMES_UNLOCKS)).toBe(true);
    expect(GAMES_UNLOCKS.length).toBeGreaterThan(0);
  });

  it('each unlock has all required fields', () => {
    for (const unlock of GAMES_UNLOCKS) {
      expect(unlock.href).toBeTruthy();
      expect(unlock.title).toBeTruthy();
      expect(unlock.description).toBeTruthy();
      expect(unlock.iconName).toBeTruthy();
      expect(unlock.iconColor).toBeTruthy();
      expect(unlock.cardColor).toBeTruthy();
      expect(unlock.requiredCorrect).toBeGreaterThan(0);
      expect(unlock.unlockMessage).toBeTruthy();
    }
  });

  it('each unlock href starts with /games/', () => {
    for (const unlock of GAMES_UNLOCKS) {
      expect(unlock.href).toMatch(/^\/games\//);
    }
  });

  it('required correct answers are positive integers', () => {
    for (const unlock of GAMES_UNLOCKS) {
      expect(Number.isInteger(unlock.requiredCorrect)).toBe(true);
      expect(unlock.requiredCorrect).toBeGreaterThan(0);
    }
  });

  it('no duplicate hrefs', () => {
    const hrefs = GAMES_UNLOCKS.map((u: GameUnlock) => u.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
