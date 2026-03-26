'use client';

import { Suspense, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import { Cards, Star } from '@phosphor-icons/react';
import { playSound } from '@/lib/sounds';
import {
  generateQuestions,
  parseTablesParam,
  parseDifficultyParam,
  randomEncouragement,
  recordProgress,
  makeShuffledAnswers,
  shuffleArray,
  type MathQuestion,
} from '@/lib/maths-helpers';

/* ── constants ─────────────────────────────────────────────────── */

const TOTAL_ROUNDS = 10;
const ITEMS_PER_CARD = 5;

const ITEM_COLORS = [
  '#E91E63', '#4CAF50', '#2196F3', '#FF9800',
  '#9C27B0', '#009688', '#F44336', '#3F51B5',
];

/* ── types ──────────────────────────────────────────────────────── */

interface CardItem {
  text: string;
  id: string;
  isMatch: boolean;
  top: string;
  left: string;
  rotation: number;
  fontSize: string;
  color: string;
}

interface RoundData {
  leftItems: CardItem[];
  rightItems: CardItem[];
}

/* ── helpers ────────────────────────────────────────────────────── */

function scatterInCircle(
  count: number,
): { top: string; left: string; rotation: number; fontSize: string }[] {
  const items = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.5 - 0.25);
    const distance = 15 + Math.random() * 25;
    const top = 50 + Math.sin(angle) * distance;
    const left = 50 + Math.cos(angle) * distance;
    const rotation = Math.floor(Math.random() * 40 - 20);
    const fontSize = `${16 + Math.floor(Math.random() * 8)}px`;
    items.push({ top: `${top}%`, left: `${left}%`, rotation, fontSize });
  }
  return items;
}

function generateRound(
  currentQuestion: MathQuestion,
  allQuestions: MathQuestion[],
): RoundData {
  // Pick decoy questions that have a different answer
  const decoys = shuffleArray(
    allQuestions.filter(
      (q) => q.question !== currentQuestion.question && q.answer !== currentQuestion.answer,
    ),
  ).slice(0, ITEMS_PER_CARD - 1);

  const leftPositions = scatterInCircle(ITEMS_PER_CARD);
  const leftItems: CardItem[] = shuffleArray(
    [currentQuestion, ...decoys].map((q, i) => ({
      text: q.question,
      id: `q-${i}`,
      isMatch: q.question === currentQuestion.question,
      ...leftPositions[i],
      color: ITEM_COLORS[i % ITEM_COLORS.length],
    })),
  );

  // Right card: correct answer + plausible wrong answers
  const rightAnswers = makeShuffledAnswers(
    currentQuestion.answer,
    currentQuestion.wrongAnswers,
  );
  // Ensure we have exactly ITEMS_PER_CARD items (pad or trim)
  while (rightAnswers.length < ITEMS_PER_CARD) {
    const extra = currentQuestion.answer + rightAnswers.length + 3;
    if (!rightAnswers.includes(extra)) rightAnswers.push(extra);
  }
  const trimmedRight = rightAnswers.slice(0, ITEMS_PER_CARD);

  const rightPositions = scatterInCircle(ITEMS_PER_CARD);
  const rightItems: CardItem[] = shuffleArray(
    trimmedRight.map((num, i) => ({
      text: String(num),
      id: `a-${i}`,
      isMatch: num === currentQuestion.answer,
      ...rightPositions[i],
      color: ITEM_COLORS[(i + 3) % ITEM_COLORS.length],
    })),
  );

  return { leftItems, rightItems };
}

/* ── page wrapper ───────────────────────────────────────────────── */

export default function NumberMatchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NumberMatch />
    </Suspense>
  );
}

/* ── game component ─────────────────────────────────────────────── */

function NumberMatch() {
  const searchParams = useSearchParams();

  /* questions generated once from URL params */
  const questions = useMemo(() => {
    const tables = parseTablesParam(searchParams.get('tables'));
    const difficulty = parseDifficultyParam(searchParams.get('difficulty'));
    // Generate extra questions for decoy pool
    return generateQuestions(tables, difficulty, Math.max(TOTAL_ROUNDS + 10, 20));
  }, [searchParams]);

  const [round, setRound] = useState(0);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate round data on mount and round change
  useEffect(() => {
    if (questions.length === 0) return;
    const q = questions[round % questions.length];
    setRoundData(generateRound(q, questions));
    setSelectedQuestion(null);
    setSelectedAnswer(null);
    setFeedback(null);
    setMatchResult(null);
  }, [round, questions]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const currentQuestion = questions[round % questions.length] as MathQuestion | undefined;

  const checkMatch = useCallback(
    (questionId: string | null, answerId: string | null) => {
      if (!questionId || !answerId || !roundData || !currentQuestion) return;

      const qItem = roundData.leftItems.find((item) => item.id === questionId);
      const aItem = roundData.rightItems.find((item) => item.id === answerId);
      if (!qItem || !aItem) return;

      if (qItem.isMatch && aItem.isMatch) {
        // Correct!
        setMatchResult('correct');
        setFeedback(randomEncouragement());
        playSound('success');
        recordProgress('number_match', currentQuestion.ref, 'correct');

        timerRef.current = setTimeout(() => {
          const nextRound = round + 1;
          if (nextRound >= TOTAL_ROUNDS) {
            setFinished(true);
            playSound('achievement');
          } else {
            setRound(nextRound);
          }
        }, 1000);
      } else {
        // Wrong
        setMatchResult('wrong');
        setFeedback('Try again!');
        playSound('pop');

        timerRef.current = setTimeout(() => {
          setSelectedQuestion(null);
          setSelectedAnswer(null);
          setMatchResult(null);
          setFeedback(null);
        }, 800);
      }
    },
    [roundData, currentQuestion, round],
  );

  const handleSelectLeft = useCallback(
    (itemId: string) => {
      if (matchResult) return;
      setSelectedQuestion(itemId);
      // If answer already selected, check
      if (selectedAnswer) {
        checkMatch(itemId, selectedAnswer);
      }
    },
    [selectedAnswer, checkMatch, matchResult],
  );

  const handleSelectRight = useCallback(
    (itemId: string) => {
      if (matchResult) return;
      setSelectedAnswer(itemId);
      // If question already selected, check
      if (selectedQuestion) {
        checkMatch(selectedQuestion, itemId);
      }
    },
    [selectedQuestion, checkMatch, matchResult],
  );

  /* ── renders ─────────────────────────────────────────────────── */

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
          show
          message="Number Match champion!"
          emoji={<Star weight="duotone" size={72} color="#FFD54F" />}
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

      <div className="text-center">
        <h1 className="page-title text-2xl sm:text-3xl flex items-center justify-center gap-2">
          <Cards weight="duotone" size={32} className="text-primary" />
          Number Match
        </h1>
        <p className="text-sm text-garden-text-light mt-1">
          Find the matching pair!
        </p>
        <p className="text-xs text-garden-text-light">
          Round {round + 1} of {TOTAL_ROUNDS}
        </p>
      </div>

      {/* Cards area */}
      {roundData && (
        <motion.div
          key={round}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 px-4"
        >
          {/* Left card — questions */}
          <DobbleCard
            items={roundData.leftItems}
            borderColor="border-primary"
            label="Questions"
            selectedId={selectedQuestion}
            matchResult={matchResult}
            onSelect={handleSelectLeft}
          />

          {/* Right card — answers */}
          <DobbleCard
            items={roundData.rightItems}
            borderColor="border-accent"
            label="Answers"
            selectedId={selectedAnswer}
            matchResult={matchResult}
            onSelect={handleSelectRight}
          />
        </motion.div>
      )}

      {/* Feedback */}
      <div className="h-12 flex items-center justify-center">
        <AnimatePresence>
          {feedback && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-lg font-bold ${
                matchResult === 'correct' ? 'text-primary' : 'text-fun-orange'
              }`}
            >
              {feedback}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Dobble-style circular card ─────────────────────────────────── */

interface DobbleCardProps {
  items: CardItem[];
  borderColor: string;
  label: string;
  selectedId: string | null;
  matchResult: 'correct' | 'wrong' | null;
  onSelect: (id: string) => void;
}

function DobbleCard({
  items,
  borderColor,
  label,
  selectedId,
  matchResult,
  onSelect,
}: DobbleCardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-semibold text-garden-text-light uppercase tracking-wide">
        {label}
      </span>
      <div
        className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-white ${borderColor} border-4 shadow-lg select-none`}
      >
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          const isCorrectMatch = matchResult === 'correct' && isSelected && item.isMatch;
          const isWrongMatch = matchResult === 'wrong' && isSelected;

          return (
            <motion.button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="absolute font-bold cursor-pointer rounded-lg px-3 py-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{
                top: item.top,
                left: item.left,
                fontSize: item.fontSize,
                color: item.color,
              }}
              initial={false}
              animate={{
                scale: isSelected ? 1.15 : 1,
                rotate: item.rotation,
                x: '-50%',
                y: '-50%',
                ...(isWrongMatch
                  ? { x: ['-50%', '-45%', '-55%', '-50%'] }
                  : {}),
              }}
              transition={
                isWrongMatch
                  ? { duration: 0.3, ease: 'easeInOut' }
                  : { type: 'spring', stiffness: 300, damping: 20 }
              }
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span
                className={`
                  rounded-lg px-1 transition-shadow duration-200
                  ${isSelected ? 'ring-2 ring-offset-2 ring-primary shadow-md' : ''}
                  ${isCorrectMatch ? 'ring-4 ring-green-400 bg-green-50' : ''}
                  ${isWrongMatch ? 'ring-4 ring-red-400 bg-red-50' : ''}
                `}
              >
                {item.text}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
