'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import Button from '@/components/ui/Button';
import { playSound, speakWord } from '@/lib/sounds';
import {
  SpeakerHigh,
  Trophy,
  ArrowRight,
  Backspace,
  KeyReturn,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { Plant, PencilSimple } from '@phosphor-icons/react';

/* ── Types ── */

interface SpellingWord {
  id: number;
  word: string;
  hint: string | null;
}

interface SpellingList {
  id: number;
  name: string;
  words: SpellingWord[];
}

interface LetterResult {
  letter: string;
  status: 'correct' | 'present' | 'absent' | 'empty' | 'pending';
}

/* ── Constants ── */

const MAX_GUESSES = 6;

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

const ENCOURAGEMENTS = [
  'Amazing!',
  'Brilliant!',
  'Wonderful!',
  'Super star!',
  'Fantastic!',
  'Well done!',
  'Perfect!',
  'You got it!',
];

function getEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/* ── Guess evaluation ── */

function evaluateGuess(guess: string, target: string): LetterResult[] {
  const result: LetterResult[] = guess.split('').map((letter) => ({
    letter,
    status: 'absent' as const,
  }));

  const targetLetters = target.split('');
  const remaining: string[] = [];

  // First pass: mark correct (green)
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === targetLetters[i]) {
      result[i].status = 'correct';
    } else {
      remaining.push(targetLetters[i]);
    }
  }

  // Second pass: mark present (yellow)
  for (let i = 0; i < guess.length; i++) {
    if (result[i].status === 'correct') continue;
    const idx = remaining.indexOf(guess[i]);
    if (idx !== -1) {
      result[i].status = 'present';
      remaining.splice(idx, 1);
    }
  }

  return result;
}

/* ── Page wrapper with Suspense ── */

export default function WordalPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Wordal />
    </Suspense>
  );
}

/* ── Main game component ── */

function Wordal() {
  const searchParams = useSearchParams();
  const [list, setList] = useState<SpellingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [noList, setNoList] = useState(false);
  const [error, setError] = useState(false);

  // Game state per word
  const [wordOrder, setWordOrder] = useState<number[]>([]);
  const [orderIndex, setOrderIndex] = useState(0);
  const [guesses, setGuesses] = useState<LetterResult[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [keyStatuses, setKeyStatuses] = useState<Record<string, string>>({});
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [shake, setShake] = useState(false);

  const gameContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Fetch spelling list
  useEffect(() => {
    const listId = searchParams.get('listId');
    fetch(listId ? `/api/spellings/${listId}` : '/api/spellings?active=true')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.json();
      })
      .then((raw) => {
        const data: SpellingList[] = Array.isArray(raw) ? raw : [raw];
        if (data.length > 0 && data[0].words.length > 0) {
          setList(data[0]);
          const indices = data[0].words.map((_, i) => i);
          const shuffled = shuffleArray(indices);
          setWordOrder(shuffled);
        } else {
          setNoList(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const currentWordObj = list && wordOrder.length > 0 ? list.words[wordOrder[orderIndex]] : null;
  const targetWord = currentWordObj?.word.toUpperCase() ?? '';
  const wordLength = targetWord.length;

  // Reset game state for a new word
  const resetForNewWord = useCallback(() => {
    setGuesses([]);
    setCurrentGuess('');
    setCurrentRow(0);
    setKeyStatuses({});
    setRevealingRow(null);
    setGameOver(false);
    setGameWon(false);
    setShowCelebration(false);
    setShowResult(false);
    setShake(false);
  }, []);

  // Advance to next word
  const nextWord = useCallback(() => {
    if (!list) return;
    const nextIdx = orderIndex + 1;
    if (nextIdx < wordOrder.length) {
      setOrderIndex(nextIdx);
      resetForNewWord();
    } else {
      setAllDone(true);
    }
  }, [list, orderIndex, wordOrder.length, resetForNewWord]);

  // Update keyboard statuses after a guess
  const updateKeyStatuses = useCallback(
    (results: LetterResult[]) => {
      setKeyStatuses((prev) => {
        const updated = { ...prev };
        for (const { letter, status } of results) {
          const current = updated[letter];
          // Priority: correct > present > absent
          if (status === 'correct') {
            updated[letter] = 'correct';
          } else if (status === 'present' && current !== 'correct') {
            updated[letter] = 'present';
          } else if (status === 'absent' && !current) {
            updated[letter] = 'absent';
          }
        }
        return updated;
      });
    },
    [],
  );

  // Submit a guess
  const submitGuess = useCallback(() => {
    if (gameOver || revealingRow !== null) return;
    if (currentGuess.length !== wordLength) {
      setShake(true);
      playSound('pop');
      timerRef.current = setTimeout(() => setShake(false), 500);
      return;
    }

    const results = evaluateGuess(currentGuess, targetWord);
    const newGuesses = [...guesses, results];
    setGuesses(newGuesses);
    setRevealingRow(currentRow);

    // After reveal animation completes
    const revealDuration = wordLength * 150 + 500;
    timerRef.current = setTimeout(() => {
      setRevealingRow(null);
      updateKeyStatuses(results);

      const isCorrect = results.every((r) => r.status === 'correct');
      if (isCorrect) {
        setGameOver(true);
        setGameWon(true);
        playSound('success');

        // Record progress
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity_type: 'spelling_wordal',
            activity_ref: currentWordObj?.word,
            result: 'correct',
          }),
        })
          .then(() =>
            fetch('/api/achievements', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            }),
          )
          .catch((err) => console.error('Failed to record progress:', err));

        timerRef.current = setTimeout(() => setShowCelebration(true), 300);
        timerRef.current = setTimeout(() => {
          setShowCelebration(false);
          setShowResult(true);
        }, 2500);
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameOver(true);
        setGameWon(false);
        playSound('pop');

        // Record progress
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity_type: 'spelling_wordal',
            activity_ref: currentWordObj?.word,
            result: 'helped',
          }),
        })
          .then(() =>
            fetch('/api/achievements', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            }),
          )
          .catch((err) => console.error('Failed to record progress:', err));

        timerRef.current = setTimeout(() => setShowResult(true), 800);
      } else {
        setCurrentRow((r) => r + 1);
        setCurrentGuess('');
      }
    }, revealDuration);
  }, [
    gameOver,
    revealingRow,
    currentGuess,
    wordLength,
    targetWord,
    guesses,
    currentRow,
    updateKeyStatuses,
    currentWordObj,
  ]);

  // Handle key input
  const handleKey = useCallback(
    (key: string) => {
      if (gameOver || revealingRow !== null) return;

      if (key === 'ENTER') {
        submitGuess();
      } else if (key === 'BACKSPACE') {
        setCurrentGuess((g) => g.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
        setCurrentGuess((g) => g + key);
      }
    },
    [gameOver, revealingRow, submitGuess, currentGuess.length, wordLength],
  );

  const handleKeyRef = useRef(handleKey);
  handleKeyRef.current = handleKey;

  // Physical keyboard listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === 'ENTER') {
        e.preventDefault();
        handleKeyRef.current('ENTER');
      } else if (key === 'BACKSPACE') {
        e.preventDefault();
        handleKeyRef.current('BACKSPACE');
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyRef.current(key);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /* ── Render states ── */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Breadcrumbs />
        <LoadingSpinner />
        <p className="text-garden-text-light font-semibold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Breadcrumbs />
        <div className="game-card p-10 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-extrabold text-garden-text mb-3">
            Oops! Could not load words
          </h2>
          <p className="text-garden-text-light text-lg">
            Something went wrong. Try going back and trying again!
          </p>
        </div>
      </div>
    );
  }

  if (noList || !list) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
      >
        <Breadcrumbs />
        <div className="game-card p-10 text-center max-w-md mx-auto">
          <span className="block mb-4">
            <Plant weight="duotone" size={64} color="#66BB6A" />
          </span>
          <h2 className="text-2xl font-extrabold text-garden-text mb-3">
            No words to practise!
          </h2>
          <p className="text-garden-text-light text-lg mb-6">
            Add some spelling words first!
          </p>
          <Link
            href="/entry"
            className="btn-primary text-lg px-8 py-3 no-underline inline-flex items-center gap-2"
          >
            <PencilSimple weight="duotone" size={20} /> Add Words
          </Link>
        </div>
      </motion.div>
    );
  }

  /* ── Build grid rows ── */

  function buildGridRows(): LetterResult[][] {
    const rows: LetterResult[][] = [];

    for (let r = 0; r < MAX_GUESSES; r++) {
      if (r < guesses.length) {
        // Submitted guess
        rows.push(guesses[r]);
      } else if (r === currentRow && !gameOver) {
        // Current typing row
        const row: LetterResult[] = [];
        for (let c = 0; c < wordLength; c++) {
          if (c < currentGuess.length) {
            row.push({ letter: currentGuess[c], status: 'pending' });
          } else {
            row.push({ letter: '', status: 'empty' });
          }
        }
        rows.push(row);
      } else {
        // Future empty row
        const row: LetterResult[] = Array.from({ length: wordLength }, () => ({
          letter: '',
          status: 'empty',
        }));
        rows.push(row);
      }
    }

    return rows;
  }

  const gridRows = buildGridRows();

  return (
    <motion.div
      ref={gameContainerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 pb-8 max-w-lg mx-auto"
    >
      <Breadcrumbs />

      {/* Progress counter */}
      <div className="text-center">
        <span className="text-sm font-bold text-garden-text-light">
          Word {orderIndex + 1} of {wordOrder.length}
        </span>
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="page-title text-2xl mb-1">
          ✏️ Wordal
        </h1>
        <p className="text-sm text-garden-text-light">
          Guess the spelling word in {MAX_GUESSES} tries!
        </p>
      </div>

      {/* Grid */}
      <div className="flex flex-col items-center gap-1.5 px-4">
        {gridRows.map((row, rowIdx) => (
          <motion.div
            key={`row-${rowIdx}`}
            className="flex gap-1.5"
            animate={
              rowIdx === currentRow && shake
                ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                : { x: 0 }
            }
            transition={{ duration: 0.4 }}
          >
            {row.map((cell, colIdx) => (
              <Tile
                key={`${rowIdx}-${colIdx}`}
                cell={cell}
                isRevealing={revealingRow === rowIdx}
                index={colIdx}
              />
            ))}
          </motion.div>
        ))}
      </div>

      {/* Hint */}
      {currentWordObj?.hint && (
        <div className="flex flex-col items-center gap-2 mt-1">
          <p className="text-center text-garden-text-light font-semibold text-sm px-4">
            {currentWordObj.hint}
          </p>
        </div>
      )}

      {/* Result message */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto text-center"
          >
            {gameWon ? (
              <p className="text-lg font-extrabold text-primary">
                🎉 {getEncouragement()}
              </p>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <p className="text-lg font-extrabold text-garden-text">
                  Great try! 💪
                </p>
                <p className="text-base text-garden-text-light">
                  The word was:{' '}
                  <span className="font-extrabold text-primary uppercase">
                    {targetWord}
                  </span>
                </p>
              </div>
            )}
            <div className="mt-3">
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight weight="bold" size={18} />}
                onClick={nextWord}
              >
                Next Word
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* On-screen keyboard */}
      {!showResult && (
        <div className="flex flex-col items-center gap-1.5 px-2 mt-1">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1 justify-center">
              {row.map((key) => {
                const status = keyStatuses[key];
                const isEnter = key === 'ENTER';
                const isBackspace = key === 'BACKSPACE';
                const isSpecial = isEnter || isBackspace;

                let bgClass = 'bg-gray-200 text-garden-text';
                if (status === 'correct') bgClass = 'bg-green-500 text-white';
                else if (status === 'present') bgClass = 'bg-amber-500 text-white';
                else if (status === 'absent') bgClass = 'bg-gray-400 text-white';
                if (isSpecial) bgClass = status ? bgClass : 'bg-gray-300 text-garden-text';

                return (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleKey(key)}
                    className={`
                      ${bgClass}
                      ${isSpecial ? 'px-3 min-w-[52px]' : 'min-w-[32px] sm:min-w-[40px]'}
                      h-[44px] rounded-lg font-bold text-sm sm:text-base
                      flex items-center justify-center cursor-pointer
                      select-none transition-colors duration-150
                    `}
                  >
                    {isEnter ? (
                      <KeyReturn weight="bold" size={20} />
                    ) : isBackspace ? (
                      <Backspace weight="bold" size={20} />
                    ) : (
                      key
                    )}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Celebration overlay */}
      <CelebrationOverlay
        show={showCelebration}
        message={getEncouragement()}
        emoji={<Trophy weight="duotone" size={72} color="#FFD54F" />}
        onDismiss={() => setShowCelebration(false)}
      />

      {/* All done overlay */}
      <CelebrationOverlay
        show={allDone}
        message="All words complete!"
        emoji={<Trophy weight="duotone" size={72} color="#FFD54F" />}
        onDismiss={() => setAllDone(false)}
        navigateBack
      />
    </motion.div>
  );
}

/* ── Tile component with flip animation ── */

function Tile({
  cell,
  isRevealing,
  index,
}: {
  cell: LetterResult;
  isRevealing: boolean;
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!isRevealing) return;
    const timer = setTimeout(() => setFlipped(true), index * 150);
    return () => clearTimeout(timer);
  }, [isRevealing, index]);

  // Reset flip state when cell changes (new word)
  useEffect(() => {
    if (cell.status === 'empty' || cell.status === 'pending') {
      setFlipped(false);
    }
  }, [cell.status]);

  const isSubmitted = cell.status === 'correct' || cell.status === 'present' || cell.status === 'absent';
  const showColor = isSubmitted && (!isRevealing || flipped);

  let bgClass = 'bg-white border-2 border-gray-300';
  if (showColor) {
    if (cell.status === 'correct') bgClass = 'bg-green-500 text-white border-green-500';
    else if (cell.status === 'present') bgClass = 'bg-amber-500 text-white border-amber-500';
    else if (cell.status === 'absent') bgClass = 'bg-gray-400 text-white border-gray-400';
  } else if (cell.status === 'pending') {
    bgClass = 'bg-white border-2 border-garden-text';
  } else if (cell.status === 'empty') {
    bgClass = 'bg-white border-2 border-gray-200';
  }

  return (
    <motion.div
      className="relative"
      style={{
        width: 52,
        height: 52,
        perspective: 600,
      }}
    >
      <motion.div
        initial={{ rotateX: 0 }}
        animate={{ rotateX: isRevealing && flipped ? 360 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className={`
          w-full h-full rounded-lg flex items-center justify-center
          text-xl font-extrabold uppercase select-none
          ${bgClass}
        `}
      >
        {cell.letter}
      </motion.div>
    </motion.div>
  );
}
