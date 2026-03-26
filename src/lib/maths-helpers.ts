export interface MathQuestion {
  question: string;
  answer: number;
  ref: string;
  wrongAnswers: number[];
}

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

export function randomEncouragement(): string {
  return ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

export function parseTablesParam(param: string | null): number[] {
  if (!param) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const parsed = param
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 12);
  return parsed.length > 0 ? parsed : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
}

export function parseDifficultyParam(param: string | null): Difficulty {
  const valid: Difficulty[] = ['seedling', 'sapling', 'tree', 'mighty_oak'];
  if (param && valid.includes(param as Difficulty)) return param as Difficulty;
  return 'sapling';
}

export async function recordProgress(
  activityType: string,
  activityRef: string,
  result: 'correct' | 'helped' | 'skipped',
) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity_type: activityType, activity_ref: activityRef, result }),
    });
    await fetch('/api/achievements', { method: 'POST' });
  } catch {
    // Silently fail — don't interrupt the child's experience
  }
}
