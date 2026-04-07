'use client';

import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
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
import { fetchMathsStats } from '@/lib/utils';
import { Drop, Check } from '@phosphor-icons/react';

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

interface Bubble {
  id: number;
  value: number;
  x: number;
  size: number;
  color: string;
  speed: number;
  popped: boolean;
}

let bubbleIdCounter = 0;

function makeBubbles(answers: number[]): Bubble[] {
  // Create 2 copies of each answer for more bubbles in the area
  const doubled = [...answers, ...answers];
  return doubled.map((value, idx) => {
    const id = ++bubbleIdCounter;
    return {
      id,
      value,
      x: 5 + Math.random() * 85,
      size: 64 + Math.random() * 28,
      color: BUBBLE_COLORS[id % BUBBLE_COLORS.length],
      speed: 6 + Math.random() * 4,
      popped: false,
    };
  });
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

  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [ready, setReady] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [correctPopped, setCorrectPopped] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const tables = parseTablesParam(searchParams.get('tables'));
    const difficulty = parseDifficultyParam(searchParams.get('difficulty'));
    fetchMathsStats().then(statsMap => {
      const qs = generateQuestions(tables, difficulty, TOTAL_QUESTIONS, statsMap);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuestions(qs);
      if (qs[0]) setBubbles(makeBubbles(makeShuffledAnswers(qs[0].answer, qs[0].wrongAnswers)));
      setReady(true);
    });
  }, [searchParams]);

  const question: MathQuestion | undefined = questions[currentIndex];
  const feedbackTimer = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      setCorrectPopped(false);
      if (nextQ) setBubbles(makeBubbles(makeShuffledAnswers(nextQ.answer, nextQ.wrongAnswers)));
    }
  }, [currentIndex, questions]);

  const handleBubbleTap = useCallback(
    (bubble: Bubble) => {
      if (!question || correctPopped || bubble.popped) return;

      if (bubble.value === question.answer) {
        playSound('success');
        setCorrectPopped(true);
        setFeedback(randomEncouragement());
        setBubbles((prev) => prev.map((b) => b.id === bubble.id ? { ...b, popped: true } : b));
        recordProgress('maths_bubbles', question.ref, wrongCount > 0 ? 'helped' : 'correct');
        timerRef.current = setTimeout(nextQuestion, 1200);
      } else {
        playSound('pop');
        setWrongCount((c) => c + 1);
        setBubbles((prev) => prev.map((b) => b.id === bubble.id ? { ...b, popped: true } : b));
        setFeedback('Try again!');
        if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
        feedbackTimer.current = setTimeout(() => setFeedback(null), 1500);
      }
    },
    [question, correctPopped, wrongCount, nextQuestion],
  );

  // Clean up timer
  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
    <div className="flex flex-col gap-4 pb-12 min-h-[80vh]">
      <Breadcrumbs />

      {/* Progress */}
      <div className="text-center">
        <span className="progress-text">
          Bubble {currentIndex + 1} of {questions.length}
        </span>
      </div>

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

      {/* Feedback */}
      <div className="feedback-container">
        <AnimatePresence>
          {feedback && (
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="msg-encouragement"
            >
              {feedback}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Bubble area */}
      <div
        className="relative flex-1 rounded-2xl overflow-hidden mx-auto w-full max-w-lg"
        style={{
          minHeight: '400px',
          background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 30%, #90CAF9 60%, #64B5F6 100%)',
        }}
      >
        {/* Inject keyframes for bubble float */}
        <style>{`
          @keyframes bubbleFloat {
            0% { top: 100%; }
            100% { top: -25%; }
          }
        `}</style>

        {bubbles.map((bubble) => {
            if (bubble.popped) return null;
            return (
              <button
                key={bubble.id}
                onClick={() => handleBubbleTap(bubble)}
                aria-label={"Answer " + bubble.value}
                className="absolute cursor-pointer select-none active:scale-90"
                style={{
                  left: `${bubble.x}%`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  transform: 'translateX(-50%)',
                  animation: `bubbleFloat ${bubble.speed}s linear infinite`,
                  animationDelay: `${(bubble.id % 8) * -(bubble.speed / 8)}s`,
                }}
                disabled={correctPopped}
              >
                <div
                  className={`
                    w-full h-full rounded-full bg-gradient-to-br ${bubble.color}
                    flex items-center justify-center
                    text-2xl font-extrabold text-white
                    shadow-lg relative overflow-hidden
                  `}
                >
                  <span className="absolute top-2 left-3 w-5 h-3 bg-white/40 rounded-full rotate-[-30deg]" />
                  {bubble.value}
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
