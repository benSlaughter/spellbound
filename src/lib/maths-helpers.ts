/** A generated maths question with answer and distractors. */
export interface MathQuestion {
  /** The displayed question text (e.g. "7 × 8") */
  question: string;
  /** The correct numerical answer */
  answer: number;
  /** Reference string for progress tracking (e.g. "7x8", "56÷7") */
  ref: string;
  /** Three plausible but incorrect answers for multiple choice */
  wrongAnswers: number[];
}

/**
 * Difficulty levels for maths games, themed as garden growth stages.
 * - `seedling`: Multiplication only, tables 1–6
 * - `sapling`: Multiplication only, tables 1–12
 * - `tree`: Mixed multiplication and division
 * - `mighty_oak`: Division focus with larger numbers
 */
export type Difficulty = 'seedling' | 'sapling' | 'tree' | 'mighty_oak';

const ENCOURAGING_MESSAGES = [
  'Amazing!',
  'Brilliant!',
  'Wonderful!',
  'Super star!',
  'Keep it up!',
  "You're doing great!",
  'Fantastic!',
  'Well done!',
];

/**
 * Get a random encouraging message to show after a correct answer.
 * @returns A cheerful string like "Amazing!" or "Brilliant!"
 */
export function randomEncouragement(): string {
  return ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
}

/**
 * Create a new shuffled copy of an array (Fisher-Yates shuffle).
 * @param arr - The array to shuffle
 * @returns A new array with elements in random order
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Combine the correct answer with wrong answers and shuffle them.
 * @param correct - The correct answer
 * @param wrongAnswers - Array of incorrect answers
 * @returns Shuffled array containing all answers
 */
export function makeShuffledAnswers(correct: number, wrongAnswers: number[]): number[] {
  return shuffleArray([correct, ...wrongAnswers]);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePlausibleWrongAnswers(
  correctAnswer: number,
  table: number,
  multiplier: number,
): number[] {
  const candidates = new Set<number>();

  // Nearby numbers
  candidates.add(correctAnswer + table);
  candidates.add(correctAnswer - table);
  candidates.add(correctAnswer + multiplier);
  candidates.add(correctAnswer - multiplier);
  candidates.add(correctAnswer + 1);
  candidates.add(correctAnswer - 1);
  candidates.add(correctAnswer + 2);
  candidates.add(correctAnswer - 2);

  // Other results from the same table
  for (let i = 1; i <= 12; i++) {
    if (i !== multiplier) {
      candidates.add(table * i);
    }
  }

  // Swap digit errors for larger numbers
  if (correctAnswer >= 10) {
    const digits = String(correctAnswer).split('');
    if (digits.length === 2) {
      const swapped = Number(digits[1] + digits[0]);
      if (swapped > 0 && swapped !== correctAnswer) {
        candidates.add(swapped);
      }
    }
  }

  // Remove the correct answer and non-positive numbers
  candidates.delete(correctAnswer);
  candidates.delete(0);
  for (const c of candidates) {
    if (c < 1) candidates.delete(c);
  }

  const pool = shuffle([...candidates]);
  // Return exactly 3 wrong answers
  while (pool.length < 3) {
    const fallback = correctAnswer + pool.length + 2;
    if (fallback !== correctAnswer && !pool.includes(fallback)) {
      pool.push(fallback);
    }
  }
  return pool.slice(0, 3);
}

/**
 * Generate a set of maths questions for the given tables and difficulty.
 * Questions are shuffled and truncated to the requested count.
 * @param tables - Array of times tables to include (1–12). Empty = all tables.
 * @param difficulty - Difficulty level determining question types
 * @param count - Maximum number of questions to return
 * @returns Array of shuffled MathQuestion objects
 */
export function generateQuestions(
  tables: number[],
  difficulty: Difficulty,
  count: number,
): MathQuestion[] {
  if (tables.length === 0) tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const allQuestions: MathQuestion[] = [];

  for (const table of tables) {
    const maxMultiplier =
      difficulty === 'seedling' ? 6 : 12;

    for (let m = 1; m <= maxMultiplier; m++) {
      const answer = table * m;

      if (difficulty === 'seedling' || difficulty === 'sapling') {
        // Multiplication only
        allQuestions.push({
          question: `${table} × ${m}`,
          answer,
          ref: `${table}x${m}`,
          wrongAnswers: generatePlausibleWrongAnswers(answer, table, m),
        });
      } else if (difficulty === 'tree') {
        // Mixed multiplication and division
        allQuestions.push({
          question: `${table} × ${m}`,
          answer,
          ref: `${table}x${m}`,
          wrongAnswers: generatePlausibleWrongAnswers(answer, table, m),
        });
        allQuestions.push({
          question: `${answer} ÷ ${table}`,
          answer: m,
          ref: `${answer}÷${table}`,
          wrongAnswers: generatePlausibleWrongAnswers(m, table, answer),
        });
      } else {
        // Mighty Oak — division focus, larger numbers preferred
        allQuestions.push({
          question: `${answer} ÷ ${table}`,
          answer: m,
          ref: `${answer}÷${table}`,
          wrongAnswers: generatePlausibleWrongAnswers(m, table, answer),
        });
        allQuestions.push({
          question: `${answer} ÷ ${m}`,
          answer: table,
          ref: `${answer}÷${m}`,
          wrongAnswers: generatePlausibleWrongAnswers(table, m, answer),
        });
      }
    }
  }

  return shuffle(allQuestions).slice(0, count);
}

/**
 * Parse a comma-separated string of table numbers from URL search params.
 * Returns all tables (1–12) if the param is missing or invalid.
 * @param param - The raw query parameter string (e.g. "2,5,7")
 * @returns Array of valid table numbers
 */
export function parseTablesParam(param: string | null): number[] {
  if (!param) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const parsed = param
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 12);
  return parsed.length > 0 ? parsed : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
}

/**
 * Parse a difficulty level from URL search params.
 * Returns 'sapling' if the param is missing or invalid.
 * @param param - The raw query parameter string
 * @returns A valid Difficulty value
 */
export function parseDifficultyParam(param: string | null): Difficulty {
  const valid: Difficulty[] = ['seedling', 'sapling', 'tree', 'mighty_oak'];
  if (param && valid.includes(param as Difficulty)) return param as Difficulty;
  return 'sapling';
}

/**
 * Client-side helper to record a progress event and check for new achievements.
 * Posts to /api/progress then /api/achievements. Silently fails to avoid
 * interrupting the child's experience.
 * @param activityType - Game identifier (e.g. "maths_bubbles")
 * @param activityRef - What was practised (e.g. "7x8")
 * @param result - Outcome: "correct", "helped", or "skipped"
 */
export async function recordProgress(
  activityType: string,
  activityRef: string,
  result: 'correct' | 'helped' | 'skipped',
) {
  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity_type: activityType, activity_ref: activityRef, result }),
    });
    if (!res.ok) console.error('Failed to record progress:', res.status);
    await fetch('/api/achievements', { method: 'POST' });
  } catch (err) {
    console.error('Failed to record progress:', err);
  }
}
