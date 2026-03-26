'use client';

import { Suspense, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import { Fish } from '@phosphor-icons/react';
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

const TOTAL_QUESTIONS = 10;

const LILY_COLORS = [
  'from-green-400 to-green-500',
  'from-emerald-400 to-emerald-500',
  'from-lime-400 to-lime-500',
  'from-teal-400 to-teal-500',
];

export default function NumberRiverPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NumberRiver />
    </Suspense>
  );
}

function NumberRiver() {
  const searchParams = useSearchParams();

  const [questions] = useState(() => {
    const tables = parseTablesParam(searchParams.get('tables'));
    const difficulty = parseDifficultyParam(searchParams.get('difficulty'));
    return generateQuestions(tables, difficulty, TOTAL_QUESTIONS);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tappedPad, setTappedPad] = useState<number | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<number[]>(() => {
    const q = questions[0];
    return q ? makeShuffledAnswers(q.answer, q.wrongAnswers) : [];
  });

  const question: MathQuestion | undefined = questions[currentIndex];

  const nextQuestion = useCallback(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      setFinished(true);
      playSound('achievement');
    } else {
      const nextQ = questions[nextIdx];
      setCurrentIndex(nextIdx);
      setWrongCount(0);
      setFeedback(null);
      setTappedPad(null);
      setShowSplash(false);
      if (nextQ) setAnswers(makeShuffledAnswers(nextQ.answer, nextQ.wrongAnswers));
    }
  }, [currentIndex, questions]);

  const handleLilyTap = useCallback(
    (answer: number) => {
      if (!question || tappedPad !== null) return;

      if (answer === question.answer) {
        playSound('splash');
        setTappedPad(answer);
        setShowSplash(true);
        setFeedback(randomEncouragement());
        const result = wrongCount > 0 ? 'helped' : 'correct';
        recordProgress('maths_river', question.ref, result);
        setTimeout(nextQuestion, 1500);
      } else {
        playSound('click');
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);

        if (newWrong >= 2) {
          setFeedback('Keep trying!');
        } else {
          setFeedback('Try another pad!');
        }
        setTimeout(() => {
          if (newWrong < 2) setFeedback(null);
        }, 1500);
      }
    },
    [question, tappedPad, wrongCount, nextQuestion],
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
          message="You crossed the river!"
          emoji={<Fish weight="duotone" size={72} color="#4CAF50" />}
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
        <h1 className="page-title text-2xl sm:text-3xl">
          Number River
        </h1>
        <p className="text-sm text-garden-text-light mt-1">
          Lily pad {currentIndex + 1} of {questions.length} — Hop across!
        </p>
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
              className="question-card"
            >
              <p className="text-sm text-garden-text-light font-bold mb-1">What is…</p>
              <p className="text-3xl font-extrabold text-garden-text">{question.question} ?</p>
            </motion.div>
          )}

          {/* Feedback — fixed height so it doesn't shift the layout */}
          <div className="h-14 flex items-center justify-center">
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <p className="msg-encouragement">{feedback}</p>
                  {showSplash && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 mt-1"
                    >
                      <Fish weight="duotone" size={28} color="#4CAF50" />
                      <span className="text-4xl font-extrabold">Splash!</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* River with Lily Pads */}
        <div className="flex-1 flex items-center justify-center">
        <div
          className="relative w-full max-w-md rounded-2xl overflow-hidden p-8"
          style={{
            background: 'linear-gradient(135deg, #4dd0e1 0%, #26a69a 40%, #2196f3 100%)',
            minHeight: '320px',
          }}
        >
          {/* Water ripples */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-white/30"
                style={{
                  width: `${60 + i * 30}px`,
                  height: `${30 + i * 15}px`,
                  top: `${15 + i * 18}%`,
                  left: `${10 + i * 12}%`,
                }}
                animate={{
                  x: [0, 10, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  type: 'tween',
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Lily pads */}
          <div className="relative grid grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {answers.map((ans, i) => {
                const isCorrectPad = tappedPad === ans;

                return (
                  <motion.button
                    key={`${currentIndex}-${ans}`}
                    initial={{ opacity: 0, scale: 0, rotate: -10 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: 0,
                      y: [0, -4, 0],
                      x: [0, i % 2 === 0 ? 2 : -2, 0],
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      y: { type: 'tween', duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                      x: { type: 'tween', duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                      opacity: { duration: 0.4 },
                      scale: { duration: 0.4 },
                    }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleLilyTap(ans)}
                    disabled={tappedPad !== null}
                    className={`
                      w-28 h-28 sm:w-32 sm:h-32
                      rounded-full bg-gradient-to-br ${LILY_COLORS[i % LILY_COLORS.length]}
                      flex items-center justify-center
                      text-2xl font-extrabold text-white
                      shadow-lg cursor-pointer select-none
                      mx-auto relative
                      min-w-[96px] min-h-[96px]
                      ${isCorrectPad ? 'ring-4 ring-yellow-400 bg-yellow-400' : ''}
                    `}
                  >
                    {/* Leaf vein */}
                    <span className="absolute w-12 h-[2px] bg-green-700/20 rounded top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45" />
                    <span className="absolute w-12 h-[2px] bg-green-700/20 rounded top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45" />
                    <span className="relative z-10">{ans}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
