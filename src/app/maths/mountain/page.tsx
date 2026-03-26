'use client';

import { Suspense, useState, useCallback } from 'react';
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

const TOTAL_STOPS = 10;
const ANIMAL = '🐻';

export default function MathMountainPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MathMountain />
    </Suspense>
  );
}

function MathMountain() {
  const searchParams = useSearchParams();

  const [questions] = useState(() => {
    const tables = parseTablesParam(searchParams.get('tables'));
    const difficulty = parseDifficultyParam(searchParams.get('difficulty'));
    return generateQuestions(tables, difficulty, TOTAL_STOPS);
  });

  const [currentStop, setCurrentStop] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showOwl, setShowOwl] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<number[]>(() => {
    const q = questions[0];
    return q ? makeShuffledAnswers(q.answer, q.wrongAnswers) : [];
  });

  const question: MathQuestion | undefined = questions[currentStop];

  const advanceToNext = useCallback(() => {
    const nextIdx = currentStop + 1;
    if (nextIdx >= questions.length) {
      setFinished(true);
      playSound('achievement');
    } else {
      const nextQ = questions[nextIdx];
      setCurrentStop(nextIdx);
      setWrongCount(0);
      setFeedback(null);
      setShowOwl(false);
      setAnswered(false);
      if (nextQ) setAnswers(makeShuffledAnswers(nextQ.answer, nextQ.wrongAnswers));
    }
  }, [currentStop, questions]);

  const handleAnswer = useCallback(
    (answer: number) => {
      if (!question || answered) return;

      if (answer === question.answer) {
        playSound('success');
        setFeedback(randomEncouragement());
        setAnswered(true);
        const result = showOwl ? 'helped' : wrongCount > 0 ? 'helped' : 'correct';
        recordProgress('maths_mountain', question.ref, result);
        setTimeout(advanceToNext, 1200);
      } else {
        playSound('click');
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);

        if (newWrong >= 2) {
          setShowOwl(true);
          setFeedback(`The answer is ${question.answer}! 🦉`);
          recordProgress('maths_mountain', question.ref, 'helped');
          setTimeout(advanceToNext, 2500);
        } else {
          setFeedback('Have another go! 💪');
          setTimeout(() => setFeedback(null), 1500);
        }
      }
    },
    [question, answered, wrongCount, showOwl, advanceToNext],
  );

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

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <BackButton />
        <CelebrationOverlay
          show={true}
          message="You reached the summit! 🏔️⭐"
          emoji="🏔️"
          onDismiss={() => setFinished(false)}
          navigateBack
          autoCloseMs={5000}
        />
      </div>
    );
  }

  // Mountain progress percentage (inverted — 0 is bottom, 100 is top)
  const progressPercent = (currentStop / (TOTAL_STOPS - 1)) * 100;

  return (
    <div className="flex flex-col gap-4 pb-12">
      <BackButton />

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-garden-text">
          🏔️ Math Mountain
        </h1>
        <p className="text-sm text-garden-text-light mt-1">
          Stop {currentStop + 1} of {TOTAL_STOPS} — Keep climbing!
        </p>
      </div>

      {/* Mountain Visualization */}
      <div className="relative mx-auto w-full max-w-sm">
        <div
          className="relative rounded-2xl overflow-hidden h-72"
          style={{
            background: 'linear-gradient(to top, #81C784 0%, #A5D6A7 25%, #90CAF9 50%, #BBDEFB 75%, #E3F2FD 90%, #FFFFFF 100%)',
          }}
        >
          {/* Mountain shape */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '160px solid transparent',
              borderRight: '160px solid transparent',
              borderBottom: '260px solid rgba(139,119,101,0.3)',
            }}
          />
          {/* Snow cap */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '30px solid transparent',
              borderRight: '30px solid transparent',
              borderBottom: '40px solid rgba(255,255,255,0.8)',
            }}
          />

          {/* Waypoints */}
          {Array.from({ length: TOTAL_STOPS }).map((_, i) => {
            const stopPercent = (i / (TOTAL_STOPS - 1)) * 100;
            const bottom = 8 + (stopPercent * 0.82);
            const leftOffset = 25 + Math.sin(i * 1.2) * 15;
            const reached = i <= currentStop;

            return (
              <div
                key={i}
                className="absolute flex items-center justify-center"
                style={{
                  bottom: `${bottom}%`,
                  left: `${leftOffset}%`,
                }}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-500 ${
                    reached
                      ? 'bg-yellow-400 border-yellow-500 shadow-md shadow-yellow-400/50'
                      : 'bg-white/60 border-white/80'
                  }`}
                />
              </div>
            );
          })}

          {/* Character */}
          <motion.div
            animate={{
              bottom: `${8 + (progressPercent * 0.82)}%`,
              left: `${25 + Math.sin(currentStop * 1.2) * 15 + 8}%`,
            }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className="absolute text-3xl"
            style={{ transform: 'translate(-50%, 50%)' }}
          >
            {ANIMAL}
          </motion.div>

          {/* Flag at top */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-2xl">
            🚩
          </div>
        </div>
      </div>

      {/* Question Card */}
      {question && (
        <motion.div
          key={currentStop}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto bg-white rounded-2xl shadow-md px-8 py-6 text-center max-w-sm w-full"
        >
          {/* Signpost */}
          <div className="text-4xl mb-2">🪧</div>
          <p className="text-2xl font-extrabold text-garden-text mb-4">
            {question.question} = ?
          </p>

          {/* Answer buttons */}
          <div className="grid grid-cols-2 gap-3">
            {answers.map((ans, i) => (
              <Button
                key={`${currentStop}-${ans}-${i}`}
                variant="fun"
                size="lg"
                onClick={() => handleAnswer(ans)}
                className={answered ? 'opacity-50 pointer-events-none' : ''}
              >
                {ans}
              </Button>
            ))}
          </div>

          {/* Feedback — fixed height to prevent card resize */}
          <div className="h-12 flex items-center justify-center">
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  {showOwl && <span className="text-3xl">🦉</span>}
                  <p className="text-lg font-bold text-primary">{feedback}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
