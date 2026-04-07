import { describe, it, expect } from 'vitest';
import { shuffle } from '../utils';

describe('shuffle', () => {
  it('returns a new array (does not mutate original)', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  it('returns an array of the same length', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr)).toHaveLength(5);
  });

  it('contains all original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles single element', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it('works with strings', () => {
    const arr = ['a', 'b', 'c'];
    const result = shuffle(arr);
    expect(result.sort()).toEqual(['a', 'b', 'c']);
  });
});
