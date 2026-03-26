'use client';

import { Suspense, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import { playSound } from '@/lib/sounds';
import {
  parseTablesParam,
  randomEncouragement,
  recordProgress,
  shuffleArray,
} from '@/lib/maths-helpers';
import { Eye, PencilSimple, Sparkle, Star } from '@phosphor-icons/react';

function generateWrongAnswers(correct: number, row: number, col: number): number[] {
  const candidates = new Set<number>();
  for (let i = 1; i <= 12; i++) {
    if (i !== col) candidates.add(row * i);
    if (i !== row) candidates.add(col * i);
  }
  candidates.add(correct + 1);
  candidates.add(correct - 1);
  candidates.add(correct + row);
  candidates.add(correct - row);
  candidates.delete(correct);
  candidates.delete(0);
  for (const c of candidates) { if (c < 1) candidates.delete(c); }
  const pool = [...candidates].sort(() => Math.random() - 0.5);
  while (pool.length < 3) pool.push(correct + pool.length + 2);
  return pool.slice(0, 3);
}

type Mode = 'explore' | 'practice' | 'pattern';

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function cellColor(value: number): string {
  if (value <= 12) return 'bg-green-100 text-green-800';
  if (value <= 36) return 'bg-green-200 text-green-900';
  if (value <= 64) return 'bg-yellow-100 text-yellow-800';
  if (value <= 100) return 'bg-orange-100 text-orange-800';
  return 'bg-orange-200 text-orange-900';
}

function isSquare(n: number): boolean {
  const s = Math.sqrt(n);
  return s === Math.floor(s);
}

export default function TimesTableExplorerPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TimesTableExplorer />
    </Suspense>
  );
}

function TimesTableExplorer() {
  const searchParams = useSearchParams();
  const selectedTables = parseTablesParam(searchParams.get('tables'));

  const [mode, setMode] = useState<Mode>('explore');
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);
  const [practiceCell, setPracticeCell] = useState<{ row: number; col: number } | null>(null);
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebMsg, setCelebMsg] = useState('');
  const [practiceAnswers, setPracticeAnswers] = useState<number[]>([]);

  const isHidden = useCallback(
    (row: number, col: number) => {
      if (mode !== 'practice') return false;
      const key = `${row}-${col}`;
      if (revealedCells.has(key)) return false;
      return selectedTables.includes(row) || selectedTables.includes(col);
    },
    [mode, revealedCells, selectedTables],
  );

  const handleCellClick = (row: number, col: number) => {
    if (mode === 'practice' && isHidden(row, col)) {
      playSound('click');
      setPracticeCell({ row, col });
      const correct = row * col;
      const wrong = generateWrongAnswers(correct, row, col);
      setPracticeAnswers(shuffleArray([correct, ...wrong]));
    }
  };

  const handleAnswer = (answer: number, row: number, col: number) => {
    const correct = row * col;
    if (answer === correct) {
      playSound('success');
      setRevealedCells((prev) => new Set(prev).add(`${row}-${col}`));
      setPracticeCell(null);
      setCelebMsg(randomEncouragement());
      setShowCelebration(true);
      recordProgress('maths_explorer', `${row}x${col}`, 'correct');
    } else {
      playSound('pop');
    }
  };

  const highlighted = hoverCell
    ? { row: hoverCell.row, col: hoverCell.col }
    : null;

  const fact = highlighted
    ? `${highlighted.row} × ${highlighted.col} = ${highlighted.row * highlighted.col}`
    : null;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Breadcrumbs />

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-garden-text">
          Times Table Explorer
        </h1>
        <p className="text-garden-text-light mt-1">
          Tap any cell to explore — no wrong answers here!
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex flex-wrap justify-center gap-2">
        {(['explore', 'practice', 'pattern'] as Mode[]).map((m) => (
          <Button
            key={m}
            variant={mode === m ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setMode(m);
              setPracticeCell(null);
              playSound('click');
            }}
          >
            {m === 'explore' && <><Eye weight="duotone" size={16} className="inline mr-1" /> Explore</>}
            {m === 'practice' && <><PencilSimple weight="duotone" size={16} className="inline mr-1" /> Practice</>}
            {m === 'pattern' && <><Sparkle weight="duotone" size={16} className="inline mr-1" /> Patterns</>}
          </Button>
        ))}
      </div>

      {/* Current fact display — fixed height to prevent layout shift */}
      <div className="min-h-[52px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {fact && (
            <motion.div
              key={fact}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-2xl font-extrabold text-primary bg-primary/10 rounded-2xl py-3 px-6"
            >
              {fact}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pattern legend */}
      {mode === 'pattern' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap justify-center gap-3 text-sm"
        >
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-purple-300 inline-block" /> Square numbers
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-blue-300 inline-block" /> Multiples of 5
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-pink-200 inline-block" /> Even numbers
          </span>
        </motion.div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[420px] mx-auto w-fit">
          <table className="border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-10 h-10 text-sm font-bold text-garden-text-light">×</th>
                {NUMBERS.map((n) => (
                  <th
                    key={n}
                    className={`w-10 h-10 text-sm font-bold rounded-lg transition-colors ${
                      highlighted?.col === n
                        ? 'bg-accent-light text-accent-dark'
                        : 'text-garden-text-light'
                    }`}
                  >
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NUMBERS.map((row) => (
                <tr key={row}>
                  <td
                    className={`w-10 h-10 text-sm font-bold text-center rounded-lg transition-colors ${
                      highlighted?.row === row
                        ? 'bg-accent-light text-accent-dark'
                        : 'text-garden-text-light'
                    }`}
                  >
                    {row}
                  </td>
                  {NUMBERS.map((col) => {
                    const value = row * col;
                    const hidden = isHidden(row, col);
                    const isHighlightedCell =
                      highlighted?.row === row || highlighted?.col === col;
                    const isExactCell =
                      highlighted?.row === row && highlighted?.col === col;

                    let patternClass = '';
                    if (mode === 'pattern') {
                      if (row === col && isSquare(value)) patternClass = 'ring-2 ring-purple-400 bg-purple-200/60';
                      else if (value % 5 === 0) patternClass = 'ring-2 ring-blue-400 bg-blue-200/40';
                      else if (value % 2 === 0) patternClass = 'bg-pink-100/50';
                    }

                    return (
                      <td key={col} className="p-0">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onMouseEnter={() => setHoverCell({ row, col })}
                          onMouseLeave={() => setHoverCell(null)}
                          onClick={() => handleCellClick(row, col)}
                          className={`
                            w-10 h-10 text-xs sm:text-sm font-bold rounded-lg
                            transition-all duration-150 cursor-pointer
                            flex items-center justify-center
                            ${hidden ? 'bg-secondary/60 text-secondary-dark hover:bg-secondary' : cellColor(value)}
                            ${isExactCell ? 'ring-2 ring-primary z-10' : ''}
                            ${isHighlightedCell && !isExactCell ? 'brightness-110 ring-1 ring-accent-light' : ''}
                            ${patternClass}
                          `}
                        >
                          {hidden ? '?' : value}
                        </motion.button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Practice answer overlay */}
      <AnimatePresence>
        {practiceCell && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-garden-border p-6 z-50"
          >
            <div className="max-w-md mx-auto text-center">
              <p className="text-xl font-extrabold text-garden-text mb-4">
                {practiceCell.row} × {practiceCell.col} = ?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {practiceAnswers.map((ans, i) => (
                    <Button
                      key={`${ans}-${i}`}
                      variant="secondary"
                      size="lg"
                      onClick={() =>
                        handleAnswer(ans, practiceCell.row, practiceCell.col)
                      }
                    >
                      {ans}
                    </Button>
                  ))}
              </div>
              <button
                onClick={() => setPracticeCell(null)}
                className="mt-3 text-garden-text-light font-bold text-sm cursor-pointer"
              >
                Skip →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CelebrationOverlay
        show={showCelebration}
        message={celebMsg}
        emoji={<Star weight="duotone" size={72} color="#FFD54F" />}
        onDismiss={() => setShowCelebration(false)}
        autoCloseMs={1500}
      />
    </div>
  );
}
