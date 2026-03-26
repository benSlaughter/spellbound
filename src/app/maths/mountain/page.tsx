'use client';

import { Suspense, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import { Flag, Signpost, Mountains, Star, PersonSimpleHike } from '@phosphor-icons/react';
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
      setAnswered(false);
      if (nextQ) setAnswers(makeShuffledAnswers(nextQ.answer, nextQ.wrongAnswers));
    }
  }, [currentStop, questions]);

  const wrongMessages = ['Have another go!', 'Keep trying!', 'Nearly there!'];

  const handleAnswer = useCallback(
    (answer: number) => {
      if (!question || answered) return;

      if (answer === question.answer) {
        playSound('success');
        setFeedback(randomEncouragement());
        setAnswered(true);
        const result = wrongCount > 0 ? 'helped' : 'correct';
        recordProgress('maths_mountain', question.ref, result);
        setTimeout(advanceToNext, 1200);
      } else {
        playSound('click');
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);
        setFeedback(wrongMessages[Math.min(newWrong - 1, wrongMessages.length - 1)]);
        setTimeout(() => setFeedback(null), 1500);
      }
    },
    [question, answered, wrongCount, advanceToNext],
  );

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
          message="You reached the summit!"
          emoji={<Mountains weight="duotone" size={72} color="#8D6E63" />}
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
      <Breadcrumbs />

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-garden-text">
          Math Mountain
        </h1>
        <p className="text-sm text-garden-text-light mt-1">
          Stop {currentStop + 1} of {TOTAL_STOPS} — Keep climbing!
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:gap-6">
      {/* Mountain Visualization */}
      <div className="relative mx-auto w-full max-w-sm md:mx-0">
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
            const t = i / (TOTAL_STOPS - 1); // 0 at bottom, 1 at top
            const bottom = 4 + t * 86;
            // Mountain narrows linearly; right-side markers pulled in more
            const amplitude = (1 - t) * 18;
            const isRight = i % 2 !== 0;
            const sideOffset = isRight ? amplitude * 0.65 : amplitude;
            const leftOffset = 50 + (isRight ? 1 : -1) * sideOffset;
            // Right-side markers sit slightly lower
            const adjustedBottom = isRight ? bottom - 2 : bottom;
            const reached = i <= currentStop;

            return (
              <div
                key={i}
                className="absolute flex items-center justify-center"
                style={{
                  bottom: `${adjustedBottom}%`,
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
              bottom: (() => {
                const t = progressPercent / 100;
                const b = 4 + t * 86;
                return `${currentStop % 2 !== 0 ? b - 2 : b}%`;
              })(),
              left: (() => {
                const t = progressPercent / 100;
                const amp = (1 - t) * 18;
                const isRight = currentStop % 2 !== 0;
                const sideOff = isRight ? amp * 0.65 : amp;
                return `${50 + (isRight ? 1 : -1) * sideOff}%`;
              })(),
            }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className="absolute"
            style={{ transform: 'translate(-50%, 50%)' }}
          >
            <PersonSimpleHike weight="duotone" size={32} color="#8D6E63" />
          </motion.div>

          {/* Flag at top */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2">
            <Flag weight="duotone" size={28} color="#EF5350" />
          </div>
        </div>
      </div>

      {/* Question Card */}
      {question && (
        <motion.div
          key={currentStop}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto bg-white rounded-2xl shadow-md px-8 py-6 text-center max-w-sm w-full md:flex-1"
        >
          {/* Signpost */}
          <div className="mb-2 flex justify-center"><Signpost weight="duotone" size={40} color="#8D6E63" /></div>
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
                  <p className="text-lg font-bold text-primary">{feedback}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
      </div>
    </div>
  );
}
