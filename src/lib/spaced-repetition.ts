/**
 * Spaced Repetition Engine for SpellBound.
 *
 * Sorts learning items (words or maths facts) by confidence — weakest first.
 * Uses weighted scoring with time decay so recently-missed items surface more.
 *
 * Design principles:
 * - Simple, not SM-2. This is a 10-year-old's spelling app.
 * - Unseen items are introduced gradually (capped per session).
 * - Within confidence bands, items are shuffled for variety.
 * - The child never sees scores or numbers — this is invisible scaffolding.
 */

import { shuffle } from './utils';

/** Per-item stats from the progress table. */
export interface ItemStats {
  ref: string;
  correct: number;
  helped: number;
  skipped: number;
  total: number;
  lastSeen: string | null;
}

/** Result weights: correct is full credit, helped is partial, skipped is zero. */
const WEIGHT_CORRECT = 1.0;
const WEIGHT_HELPED = 0.5;
const WEIGHT_SKIPPED = 0.0;

/** How many days until old results decay to half their weight. */
const DECAY_HALF_LIFE_DAYS = 14;

/** Maximum new (unseen) items to introduce per session. */
const MAX_NEW_PER_SESSION = 3;

/**
 * Calculate a confidence score for an item (0–1).
 * Higher = more confident = less need to practise.
 *
 * - Unseen items return 0 (lowest confidence).
 * - Weights: correct=1, helped=0.5, skipped=0.
 * - Recent results count more (exponential decay with 14-day half-life).
 */
export function calculateConfidence(stats: ItemStats): number {
  if (stats.total === 0) return 0;

  const weightedScore =
    stats.correct * WEIGHT_CORRECT +
    stats.helped * WEIGHT_HELPED +
    stats.skipped * WEIGHT_SKIPPED;

  const ratio = weightedScore / stats.total;

  // Apply recency boost: if last seen recently, confidence holds.
  // If last seen long ago, confidence decays toward zero.
  if (!stats.lastSeen) return 0;

  const daysSinceLastSeen = Math.max(
    0,
    (Date.now() - new Date(stats.lastSeen).getTime()) / (1000 * 60 * 60 * 24)
  );
  const decayFactor = Math.pow(0.5, daysSinceLastSeen / DECAY_HALF_LIFE_DAYS);

  return ratio * decayFactor;
}

/**
 * Sort items for a learning session: weakest first, with controlled new item introduction.
 *
 * Strategy:
 * 1. Split items into "new" (unseen) and "review" (seen before).
 * 2. Cap new items at MAX_NEW_PER_SESSION.
 * 3. Sort review items by confidence (lowest first).
 * 4. Interleave: new items spread across the first half, review items fill the rest.
 * 5. Shuffle within confidence bands to avoid predictability.
 *
 * @param items - All available items (word strings or fact refs)
 * @param statsMap - Map of item ref → stats from progress history
 * @returns Items sorted for optimal learning
 */
export function sortForSession(
  items: string[],
  statsMap: Map<string, ItemStats>,
): string[] {
  const newItems: string[] = [];
  const reviewItems: { ref: string; confidence: number }[] = [];

  for (const item of items) {
    const stats = statsMap.get(item);
    if (!stats || stats.total === 0) {
      newItems.push(item);
    } else {
      reviewItems.push({ ref: item, confidence: calculateConfidence(stats) });
    }
  }

  // Sort review items by confidence (weakest first)
  reviewItems.sort((a, b) => a.confidence - b.confidence);

  // Shuffle within confidence bands (bands of 0.15) for variety
  const bandedReview = shuffleWithinBands(
    reviewItems.map(r => r.ref),
    reviewItems.map(r => r.confidence),
    0.15,
  );

  // Cap new items
  const cappedNew = shuffle(newItems).slice(0, MAX_NEW_PER_SESSION);

  // Interleave: spread new items across the session
  return interleave(cappedNew, bandedReview);
}

/**
 * Shuffle items within confidence bands to add variety without losing priority order.
 */
function shuffleWithinBands(
  items: string[],
  scores: number[],
  bandSize: number,
): string[] {
  if (items.length === 0) return [];

  const result: string[] = [];
  let bandStart = 0;

  while (bandStart < items.length) {
    const bandMin = scores[bandStart];
    let bandEnd = bandStart;

    while (bandEnd < items.length && scores[bandEnd] - bandMin < bandSize) {
      bandEnd++;
    }

    const band = items.slice(bandStart, bandEnd);
    result.push(...shuffle(band));
    bandStart = bandEnd;
  }

  return result;
}

/**
 * Interleave new items evenly among review items.
 * New items are spread across the first portion of the session.
 */
function interleave(newItems: string[], reviewItems: string[]): string[] {
  if (newItems.length === 0) return reviewItems;
  if (reviewItems.length === 0) return newItems;

  const result: string[] = [];
  const totalSlots = newItems.length + reviewItems.length;
  const newInterval = Math.max(2, Math.floor(totalSlots / (newItems.length + 1)));

  let newIdx = 0;
  let reviewIdx = 0;

  for (let i = 0; i < totalSlots; i++) {
    if (newIdx < newItems.length && i > 0 && i % newInterval === 0) {
      result.push(newItems[newIdx++]);
    } else if (reviewIdx < reviewItems.length) {
      result.push(reviewItems[reviewIdx++]);
    } else if (newIdx < newItems.length) {
      result.push(newItems[newIdx++]);
    }
  }

  return result;
}

/**
 * Normalise a maths activity_ref to a canonical form.
 * "8x7" and "7x8" both become "7x8" (min first).
 * Division refs like "56÷7" are left as-is.
 */
export function canonicalMathsRef(ref: string): string {
  const multMatch = ref.match(/^(\d+)x(\d+)$/);
  if (multMatch) {
    const a = parseInt(multMatch[1], 10);
    const b = parseInt(multMatch[2], 10);
    return `${Math.min(a, b)}x${Math.max(a, b)}`;
  }
  return ref;
}
