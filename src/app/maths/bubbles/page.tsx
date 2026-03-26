'use client';

import { Suspense, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
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
import { Drop, Check, HandFist } from '@phosphor-icons/react';

const TOTAL_QUESTIONS = 10;

const BUBBLE_COLORS = [
  'from-blue-300 to-blue-400',
  'from-green-300 to-green-400',
  'from-pink-300 to-pink-400',
  'from-purple-300 to-purple-400',
  'from-yellow-300 to-yellow-400',
  'from-teal-300 to-teal-400',
  'from-orange-300 to-orange-400',
  'from-indigo-300 to-indigo-400',
];

const BUBBLE_SIZES = ['w-24 h-24', 'w-28 h-28', 'w-26 h-26', 'w-24 h-24'];

function shuffleColors() {
  return [...BUBBLE_COLORS].sort(() => Math.random() - 0.5).slice(0, 4);
}
function shuffleSizes() {
  return [...BUBBLE_SIZES].sort(() => Math.random() - 0.5);
}

export default function NumberBubblesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NumberBubbles />
    </Suspense>
  );
}

function NumberBubbles() {
  const searchParams = useSearchParams();

  // useState ensures questions are generated once on mount and never
  // regenerated on re-render (useMemo was unstable because parseTablesParam
  // returns a new array reference each render).
  const [questions] = useState(() => {
    const tables = parseTablesParam(searchParams.get('tables'));
    const difficulty = parseDifficultyParam(searchParams.get('difficulty'));
    return generateQuestions(tables, difficulty, TOTAL_QUESTIONS);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [poppedAnswer, setPoppedAnswer] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [colors, setColors] = useState(shuffleColors);
  const [sizes, setSizes] = useState(shuffleSizes);
  const [answers, setAnswers] = useState<number[]>(() => {
    const q = questions[0];
    return q ? makeShuffledAnswers(q.answer, q.wrongAnswers) : [];
  });

  const question: MathQuestion | undefined = questions[currentIndex];

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      playSound('achievement');
    } else {
      const nextIdx = currentIndex + 1;
      const nextQ = questions[nextIdx];
      setCurrentIndex(nextIdx);
      setWrongCount(0);
      setFeedback(null);
      setPoppedAnswer(null);
      setColors(shuffleColors());
      setSizes(shuffleSizes());
      if (nextQ) setAnswers(makeShuffledAnswers(nextQ.answer, nextQ.wrongAnswers));
    }
  }, [currentIndex, questions]);

  const handleBubbleTap = useCallback(
    (answer: number) => {
      if (!question || poppedAnswer !== null) return;

      if (answer === question.answer) {
        playSound('pop');
        setPoppedAnswer(answer);
        setFeedback(randomEncouragement());
        recordProgress('maths_bubbles', question.ref, wrongCount > 0 ? 'helped' : 'correct');
        setTimeout(nextQuestion, 1200);
      } else {
        playSound('click');
        setWrongCount((c) => c + 1);
        setFeedback('Try again!');
        setTimeout(() => setFeedback(null), 1500);
      }
    },
    [question, poppedAnswer, wrongCount, nextQuestion],
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
          message="You popped all the bubbles!"
          emoji={<Drop weight="duotone" size={72} color="#2196F3" />}
          onDismiss={() => setFinished(false)}
          navigateBack
          autoCloseMs={5000}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12 min-h-[80vh]">
      <Breadcrumbs />

      {/* Progress */}
      <div className="text-center">
        <span className="text-sm font-bold text-garden-text-light">
          Bubble {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:gap-8 flex-1">
        {/* Question + Feedback */}
        <div className="flex flex-col gap-6 md:flex-1">
          {/* Question */}
          {question && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto bg-white rounded-2xl shadow-md px-8 py-5 text-center"
            >
              <p className="text-sm text-garden-text-light font-bold mb-1">What is…</p>
              <p className="text-3xl font-extrabold text-garden-text">{question.question} ?</p>
            </motion.div>
          )}

          {/* Feedback — fixed height so it doesn't shift the layout */}
          <div className="h-10 flex items-center justify-center">
            <AnimatePresence>
              {feedback && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-xl font-extrabold text-primary"
                >
                  {feedback}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bubbles */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {answers.map((ans, i) => {
              const isPopped = poppedAnswer === ans;
              const showHint = wrongCount >= 2 && ans === question?.answer;

              return (
                <motion.button
                  key={`${currentIndex}-${ans}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: isPopped ? 0 : 1,
                    scale: isPopped ? 1.5 : 1,
                    y: isPopped ? -40 : [0, -6, 0],
                    x: [0, i % 2 === 0 ? 3 : -3, 0],
                  }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  transition={{
                    y: { type: 'tween', duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                    x: { type: 'tween', duration: 3, repeat: Infinity, ease: 'easeInOut' },
                    scale: { duration: 0.3 },
                    opacity: { duration: 0.3 },
                  }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleBubbleTap(ans)}
                  className={`
                    ${sizes[i] || 'w-24 h-24'}
                    rounded-full bg-gradient-to-br ${colors[i]}
                    flex items-center justify-center
                    text-2xl font-extrabold text-white
                    shadow-lg cursor-pointer select-none
                    relative overflow-hidden
                    min-w-[96px] min-h-[96px]
                    ${showHint ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
                  `}
                  disabled={poppedAnswer !== null}
                >
                  {/* Bubble shine */}
                  <span className="absolute top-2 left-3 w-5 h-3 bg-white/40 rounded-full rotate-[-30deg]" />
                  {isPopped ? <Check weight="bold" size={24} /> : ans}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
        </div>
      </div>
    </div>
  );
}
