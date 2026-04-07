import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { calculateConfidence, canonicalMathsRef, type ItemStats } from "@/lib/spaced-repetition";
import { shuffle } from "@/lib/utils";

interface WordRow { word: string; hint: string | null; }
interface ProgressRow { activity_ref: string; total: number; correct: number; helped: number; skipped: number; last_seen: string | null; }

/**
 * GET /api/challenge
 *
 * Returns 3 weakest spelling words + 3 weakest maths facts for a mixed challenge round.
 * Spelling words come from the active list. Maths facts come from configured tables.
 */
export async function GET() {
  try {
    const db = getDb();
    const profileId = 1;

    // --- Spelling: get active list words ---
    const activeList = db.prepare(
      "SELECT id FROM spelling_lists WHERE is_active = 1 AND (profile_id = ? OR profile_id IS NULL) LIMIT 1"
    ).get(profileId) as { id: number } | undefined;

    let spellingItems: { word: string; hint: string | null; confidence: number }[] = [];

    if (activeList) {
      const words = db.prepare(
        "SELECT word, hint FROM spelling_words WHERE list_id = ?"
      ).all(activeList.id) as WordRow[];

      const spellingStats = db.prepare(
        `SELECT activity_ref, COUNT(*) as total,
                SUM(CASE WHEN result='correct' THEN 1 ELSE 0 END) as correct,
                SUM(CASE WHEN result='helped' THEN 1 ELSE 0 END) as helped,
                SUM(CASE WHEN result='skipped' THEN 1 ELSE 0 END) as skipped,
                MAX(created_at) as last_seen
         FROM progress WHERE profile_id = ? AND activity_type LIKE 'spelling_%'
         GROUP BY activity_ref`
      ).all(profileId) as ProgressRow[];

      const statsMap = new Map<string, ItemStats>();
      for (const row of spellingStats) {
        if (row.activity_ref) {
          statsMap.set(row.activity_ref, {
            ref: row.activity_ref,
            correct: row.correct,
            helped: row.helped,
            skipped: row.skipped,
            total: row.total,
            lastSeen: row.last_seen,
          });
        }
      }

      spellingItems = words.map(w => {
        const stats = statsMap.get(w.word);
        return {
          word: w.word,
          hint: w.hint,
          confidence: stats ? calculateConfidence(stats) : 0,
        };
      }).sort((a, b) => a.confidence - b.confidence);
    }

    // --- Maths: get configured tables and find weakest facts ---
    const tablesRow = db.prepare("SELECT value FROM settings WHERE key = 'maths_tables'").get() as { value: string } | undefined;
    const tables = tablesRow ? tablesRow.value.split(",").map(Number).filter(n => n >= 1 && n <= 12) : [1,2,3,4,5,6,7,8,9,10,11,12];

    const mathsStats = db.prepare(
      `SELECT activity_ref, COUNT(*) as total,
              SUM(CASE WHEN result='correct' THEN 1 ELSE 0 END) as correct,
              SUM(CASE WHEN result='helped' THEN 1 ELSE 0 END) as helped,
              SUM(CASE WHEN result='skipped' THEN 1 ELSE 0 END) as skipped,
              MAX(created_at) as last_seen
       FROM progress WHERE profile_id = ? AND activity_type LIKE 'maths_%'
       GROUP BY activity_ref`
    ).all(profileId) as ProgressRow[];

    const mathsStatsMap = new Map<string, ItemStats>();
    for (const row of mathsStats) {
      if (!row.activity_ref) continue;
      const ref = canonicalMathsRef(row.activity_ref);
      const existing = mathsStatsMap.get(ref);
      if (existing) {
        existing.correct += row.correct;
        existing.helped += row.helped;
        existing.skipped += row.skipped;
        existing.total += row.total;
        if (row.last_seen && (!existing.lastSeen || row.last_seen > existing.lastSeen)) {
          existing.lastSeen = row.last_seen;
        }
      } else {
        mathsStatsMap.set(ref, {
          ref, correct: row.correct, helped: row.helped,
          skipped: row.skipped, total: row.total, lastSeen: row.last_seen,
        });
      }
    }

    // Build all possible facts for configured tables, score them
    const allFacts: { ref: string; question: string; answer: number; confidence: number }[] = [];
    for (const t of tables) {
      for (let m = 1; m <= 12; m++) {
        const ref = `${Math.min(t, m)}x${Math.max(t, m)}`;
        if (allFacts.some(f => f.ref === ref)) continue;
        const stats = mathsStatsMap.get(ref);
        allFacts.push({
          ref,
          question: `${t} × ${m}`,
          answer: t * m,
          confidence: stats ? calculateConfidence(stats) : 0,
        });
      }
    }
    allFacts.sort((a, b) => a.confidence - b.confidence);

    // Pick 3 weakest of each, with a little shuffle within the weakest band
    const spellingPick = shuffle(spellingItems.slice(0, 6)).slice(0, 3);
    const mathsPick = shuffle(allFacts.slice(0, 6)).slice(0, 3);

    // Build challenge questions
    const questions: {
      type: 'spelling' | 'maths';
      format: 'type' | 'missing' | 'scramble' | 'multiple_choice';
      word?: string;
      hint?: string | null;
      question?: string;
      answer?: number;
      ref: string;
    }[] = [];

    const spellingFormats: ('type' | 'missing' | 'scramble')[] = ['type', 'missing', 'scramble'];
    for (let i = 0; i < spellingPick.length; i++) {
      const sp = spellingPick[i];
      questions.push({
        type: 'spelling',
        format: spellingFormats[i % spellingFormats.length],
        word: sp.word,
        hint: sp.hint,
        ref: sp.word,
      });
    }

    for (const mp of mathsPick) {
      // Generate 3 wrong answers
      const wrongs = new Set<number>();
      while (wrongs.size < 3) {
        const offset = Math.floor(Math.random() * 10) - 5 || 1;
        const wrong = mp.answer + offset;
        if (wrong !== mp.answer && wrong > 0) wrongs.add(wrong);
      }
      questions.push({
        type: 'maths',
        format: 'multiple_choice',
        question: mp.question,
        answer: mp.answer,
        ref: mp.ref,
      });
    }

    // Interleave: spelling, maths, spelling, maths...
    const interleaved: typeof questions = [];
    const sqs = questions.filter(q => q.type === 'spelling');
    const mqs = questions.filter(q => q.type === 'maths');
    for (let i = 0; i < Math.max(sqs.length, mqs.length); i++) {
      if (i < sqs.length) interleaved.push(sqs[i]);
      if (i < mqs.length) interleaved.push(mqs[i]);
    }

    return NextResponse.json({ questions: interleaved });
  } catch (err) {
    console.error("Challenge API error:", err);
    return NextResponse.json({ error: "Failed to build challenge" }, { status: 500 });
  }
}
