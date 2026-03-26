'use client';

import React, { Suspense, useState } from 'react';
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
    name: 'Rainbow Meadow',
    emoji: '🌈',
    bg: '',
    render: () => (
      <>
        {/* Sky gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #B3E5FC 50%, #E8F5E9 100%)' }} />

        {/* Rolling hills */}
        <div className="absolute rounded-[50%]" style={{ bottom: '-10%', left: '-10%', width: '70%', height: '45%', background: '#66BB6A' }} />
        <div className="absolute rounded-[50%]" style={{ bottom: '-12%', right: '-10%', width: '75%', height: '42%', background: '#4CAF50' }} />
        <div className="absolute rounded-[50%]" style={{ bottom: '-15%', left: '15%', width: '80%', height: '38%', background: '#43A047' }} />

        {/* Rainbow arcing across, partially behind hills */}
        <div className="absolute left-1/2 -translate-x-1/2 overflow-hidden" style={{ top: '15%', width: '100%', height: '65%' }}>
          <div className="flex justify-center">
            <Rainbow size={250} />
          </div>
        </div>

        {/* Sun */}
        <div className="absolute" style={{ top: '5%', right: '6%' }}>
          <Sun size={70} intensity={0.9} />
        </div>

        {/* Flowers on the hills */}
        <div className="absolute" style={{ bottom: '18%', left: '12%' }}>
          <Flower variant="sunflower" height={80} />
        </div>
        <div className="absolute" style={{ bottom: '15%', right: '18%' }}>
          <Flower variant="tulip" height={60} />
        </div>

        {/* Butterfly */}
        <div className="absolute" style={{ top: '30%', left: '65%' }}>
          <Butterfly size={35} />
        </div>
      </>
    ),
  },
  {
    name: 'Enchanted Forest',
    emoji: '🌲',
    bg: '',
    render: () => (
      <>
        {/* Dark forest sky */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1B5E20 0%, #2E7D32 30%, #1B5E20 60%, #33691E 100%)' }} />

        {/* Forest floor */}
        <div className="absolute left-0 right-0 bottom-0" style={{ height: '18%', background: 'linear-gradient(180deg, #33691E 0%, #4E342E 50%, #3E2723 100%)' }} />

        {/* Mist layer */}
        <div className="absolute left-0 right-0" style={{ top: '10%', height: '15%', background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

        {/* Cloud peeking through canopy */}
        <div className="absolute" style={{ top: '3%', right: '15%' }}>
          <Cloud variant="small" />
        </div>

        {/* Trees layered back to front */}
        <div className="absolute" style={{ bottom: '14%', right: '18%' }}>
          <Tree variant="pine" height={130} />
        </div>
        <div className="absolute" style={{ bottom: '14%', left: '22%' }}>
          <Tree variant="oak" height={160} />
        </div>
        <div className="absolute" style={{ bottom: '12%', left: '8%' }}>
          <Tree variant="sapling" height={70} />
        </div>

        {/* Owl perched near the oak */}
        <div className="absolute" style={{ top: '22%', left: '38%' }}>
          <Owl size={48} />
        </div>

        {/* Ground sprouts */}
        <div className="absolute" style={{ bottom: '14%', left: '45%' }}>
          <Sprout size={22} />
        </div>
        <div className="absolute" style={{ bottom: '13%', right: '35%' }}>
          <Sprout size={18} />
        </div>
        <div className="absolute" style={{ bottom: '15%', left: '60%' }}>
          <Sprout size={16} />
        </div>
      </>
    ),
  },
  {
    name: 'Magical Pond',
    emoji: '🐸',
    bg: '',
    render: () => (
      <>
        {/* Sky */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #81D4FA 0%, #B3E5FC 40%, #4DB6AC 45%, #26A69A 60%, #00897B 100%)' }} />

        {/* Reeds on left edge */}
        <div className="absolute rounded-sm" style={{ bottom: '30%', left: '5%', width: '3px', height: '28%', background: '#2E7D32' }} />
        <div className="absolute rounded-sm" style={{ bottom: '30%', left: '8%', width: '2px', height: '22%', background: '#388E3C' }} />
        <div className="absolute rounded-sm" style={{ bottom: '30%', left: '10%', width: '3px', height: '25%', background: '#1B5E20' }} />

        {/* Reeds on right edge */}
        <div className="absolute rounded-sm" style={{ bottom: '30%', right: '6%', width: '3px', height: '26%', background: '#2E7D32' }} />
        <div className="absolute rounded-sm" style={{ bottom: '30%', right: '9%', width: '2px', height: '20%', background: '#388E3C' }} />

        {/* Water ripple circles */}
        <div className="absolute rounded-full" style={{ bottom: '15%', left: '20%', width: '40px', height: '12px', border: '1px solid rgba(255,255,255,0.2)' }} />
        <div className="absolute rounded-full" style={{ bottom: '8%', right: '25%', width: '30px', height: '8px', border: '1px solid rgba(255,255,255,0.15)' }} />
        <div className="absolute rounded-full" style={{ bottom: '22%', right: '40%', width: '25px', height: '7px', border: '1px solid rgba(255,255,255,0.12)' }} />

        {/* Lily pads */}
        <div className="absolute" style={{ bottom: '25%', left: '25%' }}>
          <LilyPad size={90} showFlower />
        </div>
        <div className="absolute" style={{ bottom: '18%', right: '22%' }}>
          <LilyPad size={60} />
        </div>

        {/* Frog on a lily pad */}
        <div className="absolute" style={{ bottom: '32%', left: '30%' }}>
          <Frog variant="sitting" size={60} />
        </div>

        {/* Butterfly above */}
        <div className="absolute" style={{ top: '15%', right: '25%' }}>
          <Butterfly size={30} />
        </div>

        {/* Grass bank at edges */}
        <div className="absolute rounded-[50%]" style={{ bottom: '28%', left: '-5%', width: '30%', height: '20%', background: '#388E3C' }} />
        <div className="absolute rounded-[50%]" style={{ bottom: '28%', right: '-5%', width: '30%', height: '20%', background: '#2E7D32' }} />
      </>
    ),
  },
  {
    name: 'Sunny Garden',
    emoji: '🌻',
    bg: '',
    render: () => (
      <>
        {/* Bright sky */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #FFF9C4 0%, #FFECB3 25%, #C8E6C9 60%, #A5D6A7 100%)' }} />

        {/* Green ground */}
        <div className="absolute left-0 right-0 bottom-0" style={{ height: '30%', background: 'linear-gradient(180deg, #66BB6A 0%, #4CAF50 100%)' }} />

        {/* Picket fence hints */}
        <div className="absolute" style={{ bottom: '28%', left: '10%', width: '5px', height: '18%', background: 'white', borderRadius: '2px', opacity: 0.7 }} />
        <div className="absolute" style={{ bottom: '28%', left: '16%', width: '5px', height: '18%', background: 'white', borderRadius: '2px', opacity: 0.7 }} />
        <div className="absolute" style={{ bottom: '28%', left: '22%', width: '5px', height: '18%', background: 'white', borderRadius: '2px', opacity: 0.7 }} />
        {/* Fence rail */}
        <div className="absolute" style={{ bottom: '38%', left: '8%', width: '20%', height: '3px', background: 'white', opacity: 0.5 }} />

        {/* Sun */}
        <div className="absolute" style={{ top: '4%', right: '8%' }}>
          <Sun size={55} intensity={0.8} />
        </div>

        {/* Flowers — tall sunflower dominant center */}
        <div className="absolute" style={{ bottom: '26%', left: '38%' }}>
          <Flower variant="sunflower" height={100} />
        </div>
        <div className="absolute" style={{ bottom: '26%', left: '12%' }}>
          <Flower variant="daisy" height={65} />
        </div>
        <div className="absolute" style={{ bottom: '26%', right: '12%' }}>
          <Flower variant="rose" height={70} />
        </div>
        <div className="absolute" style={{ bottom: '24%', left: '60%' }}>
          <Flower variant="tulip" height={60} />
        </div>

        {/* Bee near sunflower */}
        <div className="absolute" style={{ top: '22%', left: '48%' }}>
          <Bee size={30} />
        </div>

        {/* Ground sprouts */}
        <div className="absolute" style={{ bottom: '22%', left: '50%' }}>
          <Sprout size={20} />
        </div>
        <div className="absolute" style={{ bottom: '20%', right: '30%' }}>
          <Sprout size={16} />
        </div>
      </>
    ),
  },
  {
    name: "Bear's Meadow",
    emoji: '🐻',
    bg: '',
    render: () => (
      <>
        {/* Blue sky */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #90CAF9 0%, #BBDEFB 40%, #C8E6C9 70%, #A5D6A7 100%)' }} />

        {/* Rolling green hills */}
        <div className="absolute rounded-[50%]" style={{ bottom: '-8%', left: '-15%', width: '75%', height: '40%', background: '#66BB6A' }} />
        <div className="absolute rounded-[50%]" style={{ bottom: '-10%', right: '-10%', width: '70%', height: '38%', background: '#4CAF50' }} />
        <div className="absolute rounded-[50%]" style={{ bottom: '-14%', left: '20%', width: '80%', height: '35%', background: '#43A047' }} />

        {/* Cloud */}
        <div className="absolute" style={{ top: '5%', left: '15%' }}>
          <Cloud variant="large" />
        </div>

        {/* Palm tree in background */}
        <div className="absolute" style={{ bottom: '22%', left: '8%' }}>
          <Tree variant="palm" height={120} />
        </div>

        {/* Bear — large, centered */}
        <div className="absolute" style={{ bottom: '18%', left: '50%', transform: 'translateX(-50%)' }}>
          <Bear size={70} />
        </div>

        {/* Foreground sprouts */}
        <div className="absolute" style={{ bottom: '16%', left: '35%' }}>
          <Sprout size={24} />
        </div>
        <div className="absolute" style={{ bottom: '14%', right: '20%' }}>
          <Sprout size={20} />
        </div>
        <div className="absolute" style={{ bottom: '15%', right: '40%' }}>
          <Sprout size={18} />
        </div>

        {/* Butterfly */}
        <div className="absolute" style={{ top: '25%', right: '18%' }}>
          <Butterfly size={28} color="#AB47BC" />
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
        <Breadcrumbs />
        <p className="text-garden-text-light text-lg">
          No questions to show — go back and pick some tables! 🔢
        </p>
      </div>
    );
  }

  const cols = 3;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Breadcrumbs />

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-garden-text">
          Puzzle Pieces
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
