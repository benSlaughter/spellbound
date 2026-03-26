'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import { Flame, PersonSimpleHike, DoorOpen } from '@phosphor-icons/react';
import { playSound } from '@/lib/sounds';
import {
  generateQuestions,
  parseTablesParam,
  parseDifficultyParam,
  recordProgress,
  makeShuffledAnswers,
  type MathQuestion,
} from '@/lib/maths-helpers';

const TOTAL_ROOMS = 8;

export default function MathMazePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MathMaze />
    </Suspense>
  );
}

interface RoomData {
  question: MathQuestion;
  doors: number[];
}

function MathMaze() {
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState<RoomData[] | null>(null);
  const [currentRoom, setCurrentRoom] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [disabledDoors, setDisabledDoors] = useState<Set<number>>(new Set());
  const [shakingDoor, setShakingDoor] = useState<number | null>(null);
  const [correctDoor, setCorrectDoor] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  // Generate questions client-side to avoid hydration mismatch
  useEffect(() => {
    const tables = parseTablesParam(searchParams.get('tables'));
    const difficulty = parseDifficultyParam(searchParams.get('difficulty'));
    const questions = generateQuestions(tables, difficulty, TOTAL_ROOMS);

    const roomData: RoomData[] = questions.map((q) => {
      // Pick 2 wrong answers from the available 3, then shuffle with the correct one
      const twoWrong = q.wrongAnswers.slice(0, 2);
      return {
        question: q,
        doors: makeShuffledAnswers(q.answer, twoWrong),
      };
    });

    setRooms(roomData);
  }, [searchParams]);

  const advanceToNext = useCallback(() => {
    const nextIdx = currentRoom + 1;
    if (nextIdx >= TOTAL_ROOMS) {
      setFinished(true);
      playSound('achievement');
    } else {
      setCurrentRoom(nextIdx);
      setWrongCount(0);
      setDisabledDoors(new Set());
      setShakingDoor(null);
      setCorrectDoor(null);
      setFeedback(null);
    }
  }, [currentRoom]);

  const handleDoor = useCallback(
    (answerValue: number, doorIndex: number) => {
      if (!rooms) return;
      const room = rooms[currentRoom];
      if (!room || disabledDoors.has(doorIndex) || correctDoor !== null) return;

      if (answerValue === room.question.answer) {
        playSound('success');
        setCorrectDoor(doorIndex);
        setFeedback(null);
        const result = wrongCount > 0 ? 'helped' : 'correct';
        recordProgress('maths_maze', room.question.ref, result);
        setTimeout(advanceToNext, 1200);
      } else {
        playSound('pop');
        setShakingDoor(doorIndex);
        setWrongCount((c) => c + 1);
        setFeedback('Try another door!');
        setTimeout(() => {
          setShakingDoor(null);
          setDisabledDoors((prev) => new Set(prev).add(doorIndex));
        }, 600);
      }
    },
    [rooms, currentRoom, disabledDoors, correctDoor, wrongCount, advanceToNext],
  );

  if (!rooms) {
    return <LoadingSpinner />;
  }

  if (rooms.length === 0) {
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
          show
          message="You escaped the maze!"
          emoji={<DoorOpen weight="duotone" size={72} color="#D97706" />}
          onDismiss={() => setFinished(false)}
          navigateBack
          autoCloseMs={5000}
        />
      </div>
    );
  }

  const room = rooms[currentRoom];
  const progressPercent = ((currentRoom + 1) / TOTAL_ROOMS) * 100;

  return (
    <div className="flex flex-col gap-4 pb-12">
      <Breadcrumbs />

      {/* Header */}
      <div className="text-center">
        <h1 className="page-title text-2xl sm:text-3xl">
          Math Maze
        </h1>
        <p className="text-sm text-garden-text-light mt-1">
          Room {currentRoom + 1} of {TOTAL_ROOMS} — Find your way out!
        </p>
      </div>

      {/* Progress bar */}
      <div className="mx-auto w-full max-w-md px-4">
        <div className="h-3 rounded-full bg-amber-100 border border-amber-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          />
        </div>
      </div>

      {/* Room */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRoom}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="mx-auto w-full max-w-md px-4"
        >
          <div
            className="relative rounded-2xl border-4 border-amber-400 bg-amber-50 shadow-lg overflow-hidden"
          >
            {/* Stone wall top accent */}
            <div className="h-2 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300" />

            <div className="px-6 pt-5 pb-6">
              {/* Torches and character */}
              <div className="flex items-center justify-between mb-4">
                <Flame weight="duotone" size={28} color="#F59E0B" />
                <PersonSimpleHike weight="duotone" size={40} color="#92400E" />
                <Flame weight="duotone" size={28} color="#F59E0B" />
              </div>

              {/* Question */}
              <div className="text-center mb-6">
                <p className="text-3xl sm:text-4xl font-extrabold text-amber-900">
                  {room.question.question} = ?
                </p>
              </div>

              {/* Feedback area — fixed height */}
              <div className="h-8 flex items-center justify-center mb-4">
                <AnimatePresence>
                  {feedback && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-base font-bold text-amber-700"
                    >
                      {feedback}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Doors */}
              <div className="grid grid-cols-3 gap-3">
                {room.doors.map((ans, i) => {
                  const isDisabled = disabledDoors.has(i);
                  const isShaking = shakingDoor === i;
                  const isCorrect = correctDoor === i;

                  return (
                    <motion.button
                      key={`${currentRoom}-door-${i}`}
                      onClick={() => handleDoor(ans, i)}
                      disabled={isDisabled || correctDoor !== null}
                      animate={
                        isShaking
                          ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                          : { x: 0 }
                      }
                      transition={
                        isShaking
                          ? { duration: 0.5 }
                          : { duration: 0.2 }
                      }
                      whileTap={
                        !isDisabled && correctDoor === null
                          ? { scale: 0.95 }
                          : undefined
                      }
                      className={`
                        relative flex flex-col items-center justify-end
                        pt-4 pb-5 min-h-[100px]
                        rounded-t-[40px] rounded-b-lg
                        border-2 font-extrabold text-2xl
                        cursor-pointer transition-colors duration-300
                        ${
                          isCorrect
                            ? 'bg-gradient-to-b from-green-500 to-green-700 border-green-400 text-white shadow-lg shadow-green-400/40'
                            : isDisabled
                              ? 'bg-gradient-to-b from-stone-300 to-stone-400 border-stone-300 text-stone-500 cursor-not-allowed opacity-60'
                              : 'bg-gradient-to-b from-amber-700 to-amber-900 border-amber-600 text-white hover:from-amber-600 hover:to-amber-800 active:from-amber-800 active:to-amber-950'
                        }
                      `}
                    >
                      {/* Door arch highlight */}
                      <div
                        className={`absolute top-1 left-1 right-1 h-10 rounded-t-[36px] ${
                          isCorrect
                            ? 'bg-green-400/30'
                            : isDisabled
                              ? 'bg-stone-200/30'
                              : 'bg-amber-600/30'
                        }`}
                      />
                      {/* Door handle */}
                      <div
                        className={`absolute right-3 top-1/2 w-2 h-2 rounded-full ${
                          isCorrect
                            ? 'bg-green-300'
                            : isDisabled
                              ? 'bg-stone-400'
                              : 'bg-amber-400'
                        }`}
                      />
                      <span className="relative z-10">{ans}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Stone wall bottom accent */}
            <div className="h-2 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
