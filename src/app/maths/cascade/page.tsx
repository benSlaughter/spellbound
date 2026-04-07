'use client';

import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import { Sparkle, Trophy, Lightning } from '@phosphor-icons/react';
import { playSound } from '@/lib/sounds';
import {
  generateQuestions,
  parseTablesParam,
  parseDifficultyParam,
  randomEncouragement,
  recordProgress,
  type MathQuestion,
} from '@/lib/maths-helpers';
import { fetchMathsStats } from '@/lib/utils';

const TOTAL_QUESTIONS = 10;
const GRID_COLS = 4;
const GRID_SIZE = 16;

function makeGrid(correctAnswer: number, wrongAnswers: number[]): number[] {
  const numbers = new Set<number>([correctAnswer, ...wrongAnswers]);
  while (numbers.size < GRID_SIZE) {
    const offset = Math.floor(Math.random() * 20) + 1;
    const candidate = correctAnswer + (Math.random() > 0.5 ? offset : -offset);
    if (candidate > 0) numbers.add(candidate);
  }
  const arr = Array.from(numbers).slice(0, GRID_SIZE);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getManhattanDistance(a: number, b: number): number {
  const rowA = Math.floor(a / GRID_COLS);
  const colA = a % GRID_COLS;
  const rowB = Math.floor(b / GRID_COLS);
  const colB = b % GRID_COLS;
  return Math.abs(rowA - rowB) + Math.abs(colA - colB);
}

export default function NumberCascadePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NumberCascade />
    </Suspense>
  );
}

function NumberCascade() {
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [ready, setReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [grid, setGrid] = useState<number[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [disabledTiles, setDisabledTiles] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  // Ripple cascade state
  const [rippleCenter, setRippleCenter] = useState<number | null>(null);
  const [rippleStep, setRippleStep] = useState(0);

  // Shake state for wrong answers
  const [shakingTile, setShakingTile] = useState<number | null>(null);

  // Fade-out state for grid transition
  const [gridFading, setGridFading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    const tables = parseTablesParam(searchParams.get('tables'));
    const difficulty = parseDifficultyParam(searchParams.get('difficulty'));
    fetchMathsStats().then(statsMap => {
      const qs = generateQuestions(tables, difficulty, TOTAL_QUESTIONS, statsMap);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuestions(qs);
      if (qs.length > 0) {
        setGrid(makeGrid(qs[0].answer, qs[0].wrongAnswers));
      }
      setReady(true);
    });
  }, [searchParams]);

  const question: MathQuestion | undefined = questions[currentIndex];

  const advanceToNext = useCallback(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      setFinished(true);
      playSound('achievement');
    } else {
      setGridFading(true);
      timerRef.current = setTimeout(() => {
        const nextQ = questions[nextIdx];
        setCurrentIndex(nextIdx);
        setWrongCount(0);
        setFeedback(null);
        setAnswered(false);
        setDisabledTiles(new Set());
        setRippleCenter(null);
        setRippleStep(0);
        if (nextQ) setGrid(makeGrid(nextQ.answer, nextQ.wrongAnswers));
        setGridFading(false);
      }, 300);
    }
  }, [currentIndex, questions]);

  const handleTileClick = useCallback(
    (tileIndex: number, value: number) => {
      if (!question || answered || disabledTiles.has(tileIndex)) return;

      if (value === question.answer) {
        // Correct!
        playSound('success');
        setFeedback(randomEncouragement());
        setAnswered(true);
        setRippleCenter(tileIndex);
        setRippleStep(0);

        const result = wrongCount > 0 ? 'helped' : 'correct';
        recordProgress('maths_cascade', question.ref, result);

        // Cascade ripple
        timerRef.current = setTimeout(() => setRippleStep(1), 100);
        timerRef.current = setTimeout(() => setRippleStep(2), 200);
        timerRef.current = setTimeout(() => setRippleStep(3), 300);
        timerRef.current = setTimeout(() => setRippleStep(4), 400);
        timerRef.current = setTimeout(() => advanceToNext(), 1200);
      } else {
        // Wrong
        playSound('pop');
        setShakingTile(tileIndex);
        setWrongCount((prev) => prev + 1);
        setDisabledTiles((prev) => new Set(prev).add(tileIndex));
        timerRef.current = setTimeout(() => setShakingTile(null), 500);
      }
    },
    [question, answered, disabledTiles, wrongCount, advanceToNext],
  );

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Breadcrumbs />
        <p className="text-garden-text-light text-lg">
          No questions to show — go back and pick some tables!
        </p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <Breadcrumbs />
        <CelebrationOverlay
          show={true}
          message="Number Cascade complete!"
          emoji={<Trophy weight="duotone" size={72} color="#FFD54F" />}
          onDismiss={() => setFinished(false)}
          navigateBack
          autoCloseMs={5000}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-12">
      <Breadcrumbs />

      {/* Header */}
      <div className="text-center">
        <h1 className="page-title text-2xl sm:text-3xl flex items-center justify-center gap-2">
          <Lightning weight="duotone" size={28} className="text-yellow-500" />
          Number Cascade
          <Lightning weight="duotone" size={28} className="text-yellow-500" />
        </h1>
        <p className="text-sm text-garden-text-light mt-1">
          Question {currentIndex + 1} of {TOTAL_QUESTIONS}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mx-auto w-full max-w-sm px-4">
        <div className="h-2 rounded-full bg-garden-border overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex) / TOTAL_QUESTIONS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question card */}
      {question && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="question-card max-w-sm w-full"
        >
          <p className="text-sm font-bold text-garden-text-light mb-1">What is…</p>
          <p className="text-3xl sm:text-4xl font-extrabold text-garden-text">
            {question.question} = ?
          </p>
        </motion.div>
      )}

      {/* Tile grid */}
      <div className="mx-auto w-full max-w-sm px-4">
        <AnimatePresence mode="wait">
          {!gridFading && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-4 gap-2"
            >
              {grid.map((value, i) => {
                const isCorrect = answered && rippleCenter === i;
                const isDisabled = disabledTiles.has(i);
                const isShaking = shakingTile === i;

                // Ripple distance calculation
                const dist =
                  rippleCenter !== null ? getManhattanDistance(rippleCenter, i) : -1;
                const isRippling =
                  rippleCenter !== null && rippleCenter !== i && dist <= rippleStep;

                // Ripple glow intensity decreases with distance
                const rippleOpacity =
                  isRippling ? Math.max(0.2, 1 - dist * 0.2) : 0;

                let tileClasses =
                  'relative rounded-xl font-extrabold text-xl sm:text-2xl select-none transition-colors duration-200 aspect-square flex items-center justify-center cursor-pointer border-2 ';

                if (isCorrect) {
                  tileClasses += 'bg-primary text-white border-primary shadow-lg';
                } else if (isDisabled) {
                  tileClasses +=
                    'bg-gray-100 text-gray-300 border-gray-200 opacity-40 cursor-not-allowed';
                } else if (isRippling) {
                  tileClasses +=
                    'bg-secondary border-secondary-dark text-garden-text';
                } else {
                  tileClasses +=
                    'bg-garden-card border-garden-border text-garden-text hover:border-primary/50 hover:shadow-md active:scale-95';
                }

                return (
                  <motion.button
                    key={`${currentIndex}-${i}`}
                    animate={
                      isCorrect
                        ? { scale: [1, 1.15, 1.1] }
                        : isShaking
                          ? { x: [0, -6, 6, -6, 6, 0], backgroundColor: ['#FEE2E2', '#FCA5A5', '#FEE2E2'] }
                          : isRippling
                            ? { scale: [1, 1.05, 1], opacity: rippleOpacity + 0.6 }
                            : { scale: 1 }
                    }
                    transition={
                      isCorrect
                        ? { duration: 0.4, ease: 'easeOut' }
                        : isShaking
                          ? { duration: 0.4 }
                          : isRippling
                            ? { duration: 0.3 }
                            : { duration: 0.15 }
                    }
                    onClick={() => handleTileClick(i, value)}
                    disabled={isDisabled || answered}
                    aria-label={"Answer " + value}
                    className={tileClasses}
                  >
                    {value}
                    {/* Sparkle on correct tile */}
                    {isCorrect && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-1 -right-1"
                      >
                        <Sparkle weight="fill" size={20} className="text-yellow-400" />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback */}
      <div className="feedback-container">
        <AnimatePresence>
          {feedback && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold text-primary flex items-center gap-2"
            >
              <Sparkle weight="duotone" size={20} className="text-yellow-500" />
              {feedback}
              <Sparkle weight="duotone" size={20} className="text-yellow-500" />
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
