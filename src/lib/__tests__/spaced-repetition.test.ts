import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateConfidence,
  sortForSession,
  canonicalMathsRef,
  type ItemStats,
} from '../spaced-repetition';

function makeStats(overrides: Partial<ItemStats> = {}): ItemStats {
  return {
    ref: 'test',
    correct: 0,
    helped: 0,
    skipped: 0,
    total: 0,
    lastSeen: null,
    ...overrides,
  };
}

describe('calculateConfidence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-07T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 0 for unseen items', () => {
    expect(calculateConfidence(makeStats({ total: 0 }))).toBe(0);
  });

  it('returns 0 for items with no lastSeen', () => {
    expect(calculateConfidence(makeStats({ total: 5, correct: 5 }))).toBe(0);
  });

  it('returns high confidence for recently aced items', () => {
    const stats = makeStats({
      correct: 10,
      total: 10,
      lastSeen: '2026-04-07T11:00:00Z',
    });
    const confidence = calculateConfidence(stats);
    expect(confidence).toBeGreaterThan(0.9);
  });

  it('returns lower confidence for items with mixed results', () => {
    const good = makeStats({
      correct: 8,
      helped: 2,
      total: 10,
      lastSeen: '2026-04-07T11:00:00Z',
    });
    const bad = makeStats({
      correct: 2,
      helped: 3,
      skipped: 5,
      total: 10,
      lastSeen: '2026-04-07T11:00:00Z',
    });
    expect(calculateConfidence(good)).toBeGreaterThan(calculateConfidence(bad));
  });

  it('returns lower confidence for older results (decay)', () => {
    const recent = makeStats({
      correct: 5,
      total: 5,
      lastSeen: '2026-04-07T11:00:00Z',
    });
    const old = makeStats({
      correct: 5,
      total: 5,
      lastSeen: '2026-03-01T11:00:00Z',
    });
    expect(calculateConfidence(recent)).toBeGreaterThan(
      calculateConfidence(old),
    );
  });

  it('weights helped as partial credit', () => {
    const allCorrect = makeStats({
      correct: 5,
      total: 5,
      lastSeen: '2026-04-07T11:00:00Z',
    });
    const allHelped = makeStats({
      helped: 5,
      total: 5,
      lastSeen: '2026-04-07T11:00:00Z',
    });
    expect(calculateConfidence(allCorrect)).toBeGreaterThan(
      calculateConfidence(allHelped),
    );
    expect(calculateConfidence(allHelped)).toBeGreaterThan(0);
  });
});

describe('sortForSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-07T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns all items when no stats exist', () => {
    const items = ['apple', 'banana', 'cherry'];
    const result = sortForSession(items, new Map());
    // Max 3 new items, so all should appear
    expect(result).toHaveLength(3);
    expect(result.sort()).toEqual(['apple', 'banana', 'cherry']);
  });

  it('caps new items at 3 per session', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'];
    const result = sortForSession(items, new Map());
    expect(result).toHaveLength(3);
  });

  it('puts weak items before strong items', () => {
    const items = ['weak', 'strong'];
    const stats = new Map<string, ItemStats>([
      [
        'weak',
        makeStats({
          ref: 'weak',
          correct: 1,
          skipped: 4,
          total: 5,
          lastSeen: '2026-04-07T11:00:00Z',
        }),
      ],
      [
        'strong',
        makeStats({
          ref: 'strong',
          correct: 10,
          total: 10,
          lastSeen: '2026-04-07T11:00:00Z',
        }),
      ],
    ]);
    const result = sortForSession(items, stats);
    expect(result[0]).toBe('weak');
    expect(result[1]).toBe('strong');
  });

  it('includes both new and review items', () => {
    const items = ['new1', 'new2', 'reviewed'];
    const stats = new Map<string, ItemStats>([
      [
        'reviewed',
        makeStats({
          ref: 'reviewed',
          correct: 3,
          total: 5,
          lastSeen: '2026-04-07T11:00:00Z',
        }),
      ],
    ]);
    const result = sortForSession(items, stats);
    expect(result).toHaveLength(3);
    expect(result).toContain('reviewed');
    // At least one new item should be present
    expect(result.some(r => r === 'new1' || r === 'new2')).toBe(true);
  });

  it('handles empty input', () => {
    expect(sortForSession([], new Map())).toEqual([]);
  });

  it('handles all items being reviewed', () => {
    const items = ['a', 'b'];
    const stats = new Map<string, ItemStats>([
      [
        'a',
        makeStats({
          ref: 'a',
          correct: 1,
          total: 1,
          lastSeen: '2026-04-07T11:00:00Z',
        }),
      ],
      [
        'b',
        makeStats({
          ref: 'b',
          correct: 5,
          total: 5,
          lastSeen: '2026-04-07T11:00:00Z',
        }),
      ],
    ]);
    const result = sortForSession(items, stats);
    expect(result).toHaveLength(2);
  });
});

describe('canonicalMathsRef', () => {
  it('normalises multiplication to min×max', () => {
    expect(canonicalMathsRef('8x7')).toBe('7x8');
    expect(canonicalMathsRef('7x8')).toBe('7x8');
    expect(canonicalMathsRef('12x3')).toBe('3x12');
  });

  it('leaves already-canonical refs unchanged', () => {
    expect(canonicalMathsRef('2x5')).toBe('2x5');
  });

  it('leaves division refs unchanged', () => {
    expect(canonicalMathsRef('56÷7')).toBe('56÷7');
  });

  it('handles single-digit refs', () => {
    expect(canonicalMathsRef('1x1')).toBe('1x1');
  });

  it('handles non-matching strings gracefully', () => {
    expect(canonicalMathsRef('hello')).toBe('hello');
  });
});
