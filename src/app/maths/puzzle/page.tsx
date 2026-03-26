'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import { playSound } from '@/lib/sounds';
import {
  generateQuestions,
  parseTablesParam,
  parseDifficultyParam,
  randomEncouragement,
  recordProgress,
  makeShuffledAnswers,
  type MathQuestion,
} from '@/lib/maths-helpers';
import {
  Rainbow,
  Flower,
  TreeEvergreen,
  Drop,
  PawPrint,
} from '@phosphor-icons/react';

const GRID_SIZE = 9; // 3x3

interface HiddenPicture {
  name: string;
  icon: React.ReactNode;
  imagePath: string;
}

const PICTURES: HiddenPicture[] = [
  {
    name: 'Rainbow Meadow',
    icon: <Rainbow weight="duotone" size={72} color="#E91E63" />,
    imagePath: '/images/puzzles/rainbow-meadow.svg',
  },
  {
    name: 'Enchanted Forest',
    icon: <TreeEvergreen weight="duotone" size={72} color="#2E7D32" />,
    imagePath: '/images/puzzles/enchanted-forest.svg',
  },
  {
    name: 'Pond Life',
    icon: <Drop weight="duotone" size={72} color="#42A5F5" />,
    imagePath: '/images/puzzles/pond-life.svg',
  },
  {
    name: 'Sunny Garden',
    icon: <Flower weight="duotone" size={72} color="#FFD54F" />,
    imagePath: '/images/puzzles/sunny-garden.svg',
  },
  {
    name: 'Animal Meadow',
    icon: <PawPrint weight="duotone" size={72} color="#8D6E63" />,
    imagePath: '/images/puzzles/animal-meadow.svg',
  },
];

export default function PuzzlePiecesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PuzzlePieces />
    </Suspense>
  );
}

function PuzzlePieces() {
  const searchParams = useSearchParams();

  const [pictureIndex, setPictureIndex] = useState(0);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPictureIndex(Math.floor(Math.random() * PICTURES.length));
    const tables = parseTablesParam(searchParams.get('tables'));
    const difficulty = parseDifficultyParam(searchParams.get('difficulty'));
    setQuestions(generateQuestions(tables, difficulty, GRID_SIZE));
    setReady(true);
  }, [searchParams]);

  const picture = PICTURES[pictureIndex];

  const [revealedPieces, setRevealedPieces] = useState<Set<number>>(new Set());
  const [activePiece, setActivePiece] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const activeQuestion: MathQuestion | undefined =
    activePiece !== null ? questions[activePiece] : undefined;

  function handlePieceClick(index: number) {
    if (revealedPieces.has(index)) return;
    playSound('click');
    setActivePiece(index);
    setWrongCount(0);
    setFeedback(null);
    const q = questions[index];
    if (q) setAnswers(makeShuffledAnswers(q.answer, q.wrongAnswers));
  }

  const wrongMessages = ['Try again!', 'Keep trying!', 'Nearly there!'];

  function handleAnswer(answer: number) {
    if (!activeQuestion || activePiece === null) return;

    if (answer === activeQuestion.answer) {
      playSound('success');
      setFeedback(randomEncouragement());
      const result = wrongCount > 0 ? 'helped' : 'correct';
      recordProgress('maths_puzzle', activeQuestion.ref, result);

      const newRevealed = new Set(revealedPieces);
      newRevealed.add(activePiece);
      setRevealedPieces(newRevealed);

      timerRef.current = setTimeout(() => {
        setActivePiece(null);
        setFeedback(null);
        if (newRevealed.size === GRID_SIZE) {
          playSound('achievement');
          setShowCelebration(true);
        }
      }, 800);
    } else {
      playSound('click');
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      setFeedback(wrongMessages[Math.min(newWrong - 1, wrongMessages.length - 1)]);
      timerRef.current = setTimeout(() => setFeedback(null), 1500);
    }
  }

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

  const cols = 3;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Breadcrumbs />

      <div className="text-center">
        <h1 className="page-title text-2xl sm:text-3xl">
          Puzzle Pieces
        </h1>
        <p className="text-sm text-garden-text-light mt-1">
          Solve each puzzle to reveal the hidden picture!
        </p>
      </div>

      {/* Progress */}
      <div className="text-center text-sm font-bold text-garden-text-light">
        {revealedPieces.size} of {GRID_SIZE} pieces revealed
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:gap-6">
      {/* Puzzle Grid */}
      <div className="mx-auto w-full max-w-sm md:mx-0">
        <div className="relative rounded-2xl overflow-hidden aspect-square bg-green-100">
          {/* Hidden picture underneath */}
          <div className="absolute inset-0">
            <img
              src={picture.imagePath}
              alt={picture.name}
              className="w-full h-full object-cover"
              style={{ minWidth: '100%', minHeight: '100%' }}
            />
          </div>

          {/* Puzzle pieces overlay */}
          <div
            className="absolute inset-0 grid gap-1 p-1"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: GRID_SIZE }).map((_, i) => {
              const revealed = revealedPieces.has(i);
              const q = questions[i];

              return (
                <motion.button
                  key={i}
                  animate={{ opacity: revealed ? 0 : 1 }}
                  transition={{ duration: 0.5 }}
                  onClick={() => !revealed && handlePieceClick(i)}
                  disabled={revealed}
                  className={`
                    rounded-xl flex items-center justify-center
                    text-sm font-bold select-none
                    min-h-[60px]
                    ${revealed
                      ? 'pointer-events-none'
                      : activePiece === i
                      ? 'bg-secondary ring-2 ring-secondary-dark text-garden-text cursor-pointer'
                      : 'bg-garden-card/95 hover:bg-secondary-light/60 text-garden-text-light shadow-sm cursor-pointer'
                    }
                  `}
                >
                  {!revealed && (
                    <span className="text-xs sm:text-sm leading-tight text-center px-1">
                      {q?.question || '?'}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question Modal */}
      <AnimatePresence>
        {activePiece !== null && activeQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-auto bg-white rounded-2xl shadow-lg px-6 py-5 text-center max-w-sm w-full md:flex-1"
          >
            <p className="text-2xl font-extrabold text-garden-text mb-4">
              {activeQuestion.question} = ?
            </p>

            <div className="grid grid-cols-2 gap-3">
              {answers.map((ans, i) => (
                <Button
                  key={`${activePiece}-${ans}-${i}`}
                  variant="fun"
                  size="lg"
                  onClick={() => handleAnswer(ans)}
                >
                  {ans}
                </Button>
              ))}
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 text-lg font-bold text-primary"
                >
                  {feedback}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              onClick={() => {
                setActivePiece(null);
                setFeedback(null);
              }}
              className="mt-3 text-sm text-garden-text-light font-bold cursor-pointer"
            >
              Skip →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <CelebrationOverlay
        show={showCelebration}
        message="You completed the puzzle!"
        emoji={picture.icon}
        onDismiss={() => setShowCelebration(false)}
        navigateBack
        autoCloseMs={5000}
      />
    </div>
  );
}
