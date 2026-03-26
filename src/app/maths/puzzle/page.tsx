'use client';

import React, { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BackButton from '@/components/ui/BackButton';
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
  Sun,
  Cloud,
  Flower,
  Butterfly,
  Tree,
  Owl,
  Sprout,
  Frog,
  LilyPad,
  Bee,
  Bear,
} from '@/components/svg';

const GRID_SIZE = 9; // 3x3

interface HiddenPicture {
  name: string;
  emoji: string;
  bg: string;
  render: () => React.ReactNode;
}

const PICTURES: HiddenPicture[] = [
  {
    name: 'Rainbow Scene',
    emoji: '🌈',
    bg: 'bg-gradient-to-b from-blue-200 to-green-200',
    render: () => (
      <>
        <div className="absolute" style={{ top: '5%', left: '15%' }}>
          <Rainbow size={160} />
        </div>
        <div className="absolute" style={{ top: '3%', right: '8%' }}>
          <Sun size={50} />
        </div>
        <div className="absolute" style={{ top: '12%', left: '3%' }}>
          <Cloud variant="small" />
        </div>
        <div className="absolute" style={{ bottom: '5%', left: '10%' }}>
          <Flower variant="daisy" height={50} />
        </div>
        <div className="absolute" style={{ bottom: '3%', left: '42%' }}>
          <Flower variant="sunflower" height={60} />
        </div>
        <div className="absolute" style={{ bottom: '5%', right: '12%' }}>
          <Flower variant="tulip" height={45} />
        </div>
        <div className="absolute" style={{ top: '40%', left: '58%' }}>
          <Butterfly size={30} />
        </div>
      </>
    ),
  },
  {
    name: 'Forest Scene',
    emoji: '🌲',
    bg: 'bg-gradient-to-b from-green-800 to-green-950',
    render: () => (
      <>
        <div className="absolute" style={{ top: '5%', left: '15%' }}>
          <Cloud variant="medium" />
        </div>
        <div className="absolute" style={{ bottom: '8%', left: '15%' }}>
          <Tree variant="oak" height={120} />
        </div>
        <div className="absolute" style={{ bottom: '8%', right: '12%' }}>
          <Tree variant="pine" height={100} />
        </div>
        <div className="absolute" style={{ bottom: '5%', left: '50%' }}>
          <Tree variant="sapling" height={60} />
        </div>
        <div className="absolute" style={{ top: '22%', left: '28%' }}>
          <Owl size={40} />
        </div>
        <div className="absolute" style={{ top: '12%', right: '25%' }}>
          <Butterfly size={25} />
        </div>
        <div className="absolute" style={{ bottom: '3%', left: '40%' }}>
          <Sprout size={20} />
        </div>
        <div className="absolute" style={{ bottom: '3%', right: '30%' }}>
          <Sprout size={20} />
        </div>
      </>
    ),
  },
  {
    name: 'Pond Scene',
    emoji: '🐸',
    bg: 'bg-gradient-to-b from-sky-300 to-teal-500',
    render: () => (
      <>
        <div className="absolute" style={{ top: '5%', left: '10%' }}>
          <Cloud variant="small" />
        </div>
        <div className="absolute" style={{ bottom: '25%', left: '30%' }}>
          <LilyPad size={70} showFlower />
        </div>
        <div className="absolute" style={{ bottom: '18%', right: '20%' }}>
          <LilyPad size={50} />
        </div>
        <div className="absolute" style={{ bottom: '30%', left: '35%' }}>
          <Frog variant="sitting" size={50} />
        </div>
        <div className="absolute" style={{ bottom: '10%', right: '10%' }}>
          <Flower variant="rose" height={55} />
        </div>
        <div className="absolute" style={{ top: '25%', right: '18%' }}>
          <Bee size={25} />
        </div>
      </>
    ),
  },
  {
    name: 'Garden Scene',
    emoji: '🌻',
    bg: 'bg-gradient-to-b from-orange-200 to-green-300',
    render: () => (
      <>
        <div className="absolute" style={{ top: '3%', right: '8%' }}>
          <Sun size={45} intensity={0.8} />
        </div>
        <div className="absolute" style={{ bottom: '8%', left: '38%' }}>
          <Flower variant="sunflower" height={80} />
        </div>
        <div className="absolute" style={{ bottom: '8%', left: '12%' }}>
          <Flower variant="daisy" height={50} />
        </div>
        <div className="absolute" style={{ bottom: '8%', right: '12%' }}>
          <Flower variant="tulip" height={55} />
        </div>
        <div className="absolute" style={{ bottom: '5%', left: '55%' }}>
          <Flower variant="rose" height={45} />
        </div>
        <div className="absolute" style={{ top: '25%', left: '20%' }}>
          <Butterfly size={30} />
        </div>
        <div className="absolute" style={{ top: '30%', right: '25%' }}>
          <Bee size={25} />
        </div>
        <div className="absolute" style={{ bottom: '3%', left: '28%' }}>
          <Sprout size={20} />
        </div>
      </>
    ),
  },
  {
    name: 'Meadow Scene',
    emoji: '🐻',
    bg: 'bg-gradient-to-b from-yellow-100 to-green-300',
    render: () => (
      <>
        <div className="absolute" style={{ top: '5%', left: '20%' }}>
          <Cloud variant="large" />
        </div>
        <div className="absolute" style={{ bottom: '8%', left: '5%' }}>
          <Tree variant="palm" height={90} />
        </div>
        <div className="absolute" style={{ bottom: '8%', right: '10%' }}>
          <Tree variant="sapling" height={50} />
        </div>
        <div className="absolute" style={{ bottom: '5%', left: '45%' }}>
          <Flower variant="tulip" height={55} />
        </div>
        <div className="absolute" style={{ bottom: '10%', left: '55%' }}>
          <Bear size={45} />
        </div>
        <div className="absolute" style={{ top: '15%', right: '20%' }}>
          <Butterfly size={28} color="purple" />
        </div>
        <div className="absolute" style={{ bottom: '3%', right: '35%' }}>
          <Sprout size={18} />
        </div>
      </>
    ),
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

  const [pictureIndex] = useState(
    () => Math.floor(Math.random() * PICTURES.length),
  );
  const picture = PICTURES[pictureIndex];

  const [questions] = useState(() => {
    const tables = parseTablesParam(searchParams.get('tables'));
    const difficulty = parseDifficultyParam(searchParams.get('difficulty'));
    return generateQuestions(tables, difficulty, GRID_SIZE);
  });

  const [revealedPieces, setRevealedPieces] = useState<Set<number>>(new Set());
  const [activePiece, setActivePiece] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

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

  function handleAnswer(answer: number) {
    if (!activeQuestion || activePiece === null) return;

    if (answer === activeQuestion.answer) {
      playSound('success');
      setFeedback(randomEncouragement());
      const result = wrongCount >= 2 ? 'helped' : wrongCount > 0 ? 'helped' : 'correct';
      recordProgress('maths_puzzle', activeQuestion.ref, result);

      const newRevealed = new Set(revealedPieces);
      newRevealed.add(activePiece);
      setRevealedPieces(newRevealed);

      setTimeout(() => {
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

      if (newWrong >= 2) {
        setFeedback(`The answer is ${activeQuestion.answer}! 🌟`);
        recordProgress('maths_puzzle', activeQuestion.ref, 'helped');
        const newRevealed = new Set(revealedPieces);
        newRevealed.add(activePiece);
        setRevealedPieces(newRevealed);

        setTimeout(() => {
          setActivePiece(null);
          setFeedback(null);
          if (newRevealed.size === GRID_SIZE) {
            playSound('achievement');
            setShowCelebration(true);
          }
        }, 2000);
      } else {
        setFeedback('Try again! 💪');
        setTimeout(() => setFeedback(null), 1500);
      }
    }
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <BackButton />
        <p className="text-garden-text-light text-lg">
          No questions to show — go back and pick some tables! 🔢
        </p>
      </div>
    );
  }

  const cols = 3;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <BackButton />

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-garden-text">
          🧩 Puzzle Pieces
        </h1>
        <p className="text-sm text-garden-text-light mt-1">
          Solve each puzzle to reveal the hidden picture!
        </p>
      </div>

      {/* Progress */}
      <div className="text-center text-sm font-bold text-garden-text-light">
        {revealedPieces.size} of {GRID_SIZE} pieces revealed ✨
      </div>

      {/* Puzzle Grid */}
      <div className="mx-auto w-full max-w-sm">
        <div className={`relative ${picture.bg} rounded-2xl overflow-hidden aspect-square`}>
          {/* Hidden picture underneath */}
          <div className="absolute inset-0">
            {picture.render()}
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
                <AnimatePresence key={i}>
                  {!revealed && (
                    <motion.button
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                      transition={{ duration: 0.5 }}
                      onClick={() => handlePieceClick(i)}
                      className={`
                        rounded-xl flex items-center justify-center
                        text-sm font-bold cursor-pointer select-none
                        transition-all min-h-[60px]
                        ${
                          activePiece === i
                            ? 'bg-secondary ring-2 ring-secondary-dark text-garden-text'
                            : 'bg-garden-card/95 hover:bg-secondary-light/60 text-garden-text-light shadow-sm'
                        }
                      `}
                    >
                      <span className="text-xs sm:text-sm leading-tight text-center px-1">
                        {q?.question || '?'}
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
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
            className="mx-auto bg-white rounded-2xl shadow-lg px-6 py-5 text-center max-w-sm w-full"
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

      <CelebrationOverlay
        show={showCelebration}
        message="You completed the puzzle! 🧩"
        emoji={picture.emoji}
        onDismiss={() => setShowCelebration(false)}
        navigateBack
        autoCloseMs={5000}
      />
    </div>
  );
}
