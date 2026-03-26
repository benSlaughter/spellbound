'use client';

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import Button from '@/components/ui/Button';
import { playSound, speakWord } from '@/lib/sounds';
import { Star, Trophy, SpeakerHigh } from '@phosphor-icons/react';
import Link from 'next/link';
import { Plant, PencilSimple } from '@phosphor-icons/react';

/* ── Types ── */

interface SpellingWord {
  id: number;
  word: string;
  hint: string | null;
}

interface SpellingList {
  id: number;
  name: string;
  words: SpellingWord[];
}

interface FallingLetter {
  id: number;
  letter: string;
  x: number;
  speed: number;
  delay: number;
  color: string;
  dimmed: boolean;
}

/* ── Constants ── */

const PASTEL_COLORS = [
  '#FFB3BA', // pink
  '#FFDFBA', // peach
  '#FFFFBA', // yellow
  '#BAFFC9', // mint
  '#BAE1FF', // sky
  '#D4BAFF', // lavender
  '#FFD1DC', // rose
  '#C1E1C1', // sage
  '#FADADD', // blush
  '#B5EAD7', // seafoam
];

const DECOY_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const ENCOURAGEMENTS = [
  'Amazing!', 'Brilliant!', 'Wonderful!', 'Super star!',
  'Fantastic!', 'Well done!', 'Great catch!', 'Nice one!',
];

function getEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

let letterIdCounter = 0;

function buildFallingLetters(word: string): FallingLetter[] {
  const wordLetters = word.toUpperCase().split('');

  // Pick 4-6 random decoy letters (not in the word)
  const wordSet = new Set(wordLetters);
  const available = DECOY_LETTERS.split('').filter((l) => !wordSet.has(l));
  const decoyCount = 4 + Math.floor(Math.random() * 3);
  const decoys: string[] = [];
  for (let i = 0; i < decoyCount && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    decoys.push(available[idx]);
    available.splice(idx, 1);
  }

  const allLetters = shuffleArray([...wordLetters, ...decoys]);

  return allLetters.map((letter) => {
    const id = ++letterIdCounter;
    return {
      id,
      letter,
      x: 5 + Math.random() * 85,
      speed: 5 + Math.random() * 6,
      delay: -(Math.random() * 10),
      color: PASTEL_COLORS[id % PASTEL_COLORS.length],
      dimmed: false,
    };
  });
}

/* ── Page wrapper with Suspense ── */

export default function SpellCatcherPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SpellCatcher />
    </Suspense>
  );
}

/* ── Main game component ── */

function SpellCatcher() {
  const [list, setList] = useState<SpellingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [noList, setNoList] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [caughtCount, setCaughtCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showWordComplete, setShowWordComplete] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [letters, setLetters] = useState<FallingLetter[]>([]);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const encouragementTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch spelling list
  useEffect(() => {
    const listId = new URLSearchParams(window.location.search).get('listId');
    fetch(listId ? `/api/spellings/${listId}` : '/api/spellings?active=true')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.json();
      })
      .then((raw) => {
        const data: SpellingList[] = Array.isArray(raw) ? raw : [raw];
        if (data.length > 0 && data[0].words.length > 0) {
          setList(data[0]);
          setLetters(buildFallingLetters(data[0].words[0].word));
        } else {
          setNoList(true);
        }
      })
      .catch(() => setNoList(true))
      .finally(() => setLoading(false));
  }, []);

  const currentWord = list?.words[wordIndex];
  const wordUpper = currentWord?.word.toUpperCase() ?? '';
  const nextLetterIndex = caughtCount;

  const advanceToNext = useCallback(() => {
    if (!list) return;
    if (wordIndex + 1 < list.words.length) {
      const nextIdx = wordIndex + 1;
      setWordIndex(nextIdx);
      setCaughtCount(0);
      setWrongCount(0);
      setShowWordComplete(false);
      setLetters(buildFallingLetters(list.words[nextIdx].word));
    } else {
      setShowFinal(true);
    }
  }, [list, wordIndex]);

  const handleLetterClick = useCallback(
    (fallingLetter: FallingLetter) => {
      if (!currentWord || showWordComplete) return;

      const expected = wordUpper[nextLetterIndex];

      if (fallingLetter.letter === expected) {
        playSound('success');
        const newCount = caughtCount + 1;
        setCaughtCount(newCount);

        // Remove this letter instance from the rain
        setLetters((prev) => prev.filter((l) => l.id !== fallingLetter.id));

        if (newCount === wordUpper.length) {
          // Word complete!
          setShowWordComplete(true);
          setEncouragement(getEncouragement());
          playSound('achievement');

          const result = wrongCount > 0 ? 'helped' : 'correct';
          fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activity_type: 'spelling_catcher',
              activity_ref: currentWord.word,
              result,
            }),
          })
            .then(() =>
              fetch('/api/achievements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              })
            )
            .catch((err) => console.error('Failed to record progress:', err));

          setTimeout(advanceToNext, 2500);
        } else {
          setEncouragement(getEncouragement());
          if (encouragementTimer.current) clearTimeout(encouragementTimer.current);
          encouragementTimer.current = setTimeout(() => setEncouragement(null), 1200);
        }
      } else {
        // Wrong letter
        playSound('pop');
        setWrongCount((c) => c + 1);
        setLetters((prev) =>
          prev.map((l) =>
            l.id === fallingLetter.id ? { ...l, dimmed: true } : l
          )
        );
      }
    },
    [currentWord, wordUpper, nextLetterIndex, caughtCount, wrongCount, showWordComplete, advanceToNext]
  );

  // Clean up timer
  useEffect(() => {
    return () => {
      if (encouragementTimer.current) clearTimeout(encouragementTimer.current);
    };
  }, []);

  /* ── Render states ── */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
        <p className="mt-4 text-garden-text-light font-semibold">Loading your words...</p>
      </div>
    );
  }

  if (noList || !list) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
      >
        <Breadcrumbs />
        <div className="game-card p-10 text-center max-w-md mx-auto">
          <span className="block mb-4">
            <Plant weight="duotone" size={64} color="#66BB6A" />
          </span>
          <h2 className="text-2xl font-extrabold text-garden-text mb-3">
            No words to practise!
          </h2>
          <p className="text-garden-text-light text-lg mb-6">
            Add some spelling words first!
          </p>
          <Link
            href="/entry"
            className="btn-primary text-lg px-8 py-3 no-underline inline-flex items-center gap-2"
          >
            <PencilSimple weight="duotone" size={20} /> Add Words
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 pb-8 max-w-lg mx-auto"
    >
      <Breadcrumbs />

      {/* Progress counter */}
      <div className="text-center">
        <span className="text-sm font-bold text-garden-text-light">
          Word {wordIndex + 1} of {list.words.length}
        </span>
      </div>

      {/* Title + Hear Word */}
      <div className="text-center">
        <h1 className="page-title text-2xl mb-2">
          <Star weight="duotone" size={24} color="#FFD54F" className="inline mr-1 align-text-bottom" />
          Spell Catcher
        </h1>
        <Button
          variant="secondary"
          size="md"
          icon={<SpeakerHigh weight="duotone" size={20} />}
          onClick={() => currentWord && speakWord(currentWord.word)}
        >
          Hear Word
        </Button>
      </div>

      {/* Word progress display */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {wordUpper.split('').map((letter, i) => {
          const isCaught = i < caughtCount;
          const isNext = i === caughtCount && !showWordComplete;
          return (
            <motion.div
              key={`${wordIndex}-progress-${i}`}
              animate={
                isNext
                  ? { scale: [1, 1.15, 1] }
                  : isCaught
                  ? { scale: 1 }
                  : {}
              }
              transition={
                isNext
                  ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                  : {}
              }
              className={`
                w-10 h-12 sm:w-12 sm:h-14 rounded-xl text-xl sm:text-2xl font-extrabold
                flex items-center justify-center border-2
                ${
                  isCaught
                    ? 'bg-primary text-white border-primary'
                    : isNext
                    ? 'border-accent bg-accent-light/30 border-3 text-accent-dark'
                    : 'border-garden-border bg-garden-card text-garden-border'
                }
              `}
            >
              {isCaught ? letter : isNext ? '?' : '·'}
            </motion.div>
          );
        })}
      </div>

      {/* Encouragement */}
      <div className="feedback-container">
        <AnimatePresence>
          {encouragement && (
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="msg-encouragement"
            >
              {encouragement}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Rain area */}
      <div
        className="relative rounded-2xl overflow-hidden mx-auto w-full"
        style={{
          height: '500px',
          background:
            'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 25%, #90CAF9 50%, #64B5F6 75%, #42A5F5 100%)',
        }}
      >
        {/* CSS keyframes for falling */}
        <style>{`
          @keyframes letterFall {
            0% { top: -10%; }
            100% { top: 110%; }
          }
          @keyframes letterShake {
            0%, 100% { transform: translateX(-50%) rotate(0deg); }
            25% { transform: translateX(-50%) rotate(-8deg); }
            75% { transform: translateX(-50%) rotate(8deg); }
          }
        `}</style>

        {letters.map((fl) => (
          <button
            key={fl.id}
            onClick={() => handleLetterClick(fl)}
            disabled={showWordComplete}
            className="absolute cursor-pointer select-none focus:outline-none"
            style={{
              left: `${fl.x}%`,
              width: '64px',
              height: '64px',
              transform: 'translateX(-50%)',
              animation: `letterFall ${fl.speed}s linear infinite`,
              animationDelay: `${fl.delay}s`,
              opacity: fl.dimmed ? 0.4 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-2xl font-extrabold shadow-lg"
              style={{
                backgroundColor: fl.color,
                color: '#3E2723',
              }}
            >
              {/* Shine highlight */}
              <span
                className="absolute top-2 left-3 w-5 h-3 rounded-full rotate-[-30deg]"
                style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
              />
              {fl.letter}
            </div>
          </button>
        ))}

        {/* Small cloud decorations */}
        <div
          className="absolute pointer-events-none select-none"
          style={{
            top: '8%',
            left: '10%',
            width: '80px',
            height: '30px',
            borderRadius: '20px',
            backgroundColor: 'rgba(255,255,255,0.35)',
          }}
        />
        <div
          className="absolute pointer-events-none select-none"
          style={{
            top: '15%',
            right: '15%',
            width: '60px',
            height: '22px',
            borderRadius: '15px',
            backgroundColor: 'rgba(255,255,255,0.3)',
          }}
        />
      </div>

      {/* Hint */}
      {currentWord?.hint && (
        <p className="text-center text-garden-text-light font-semibold text-sm">
          💡 {currentWord.hint}
        </p>
      )}

      {/* Celebration overlay */}
      <CelebrationOverlay
        show={showFinal}
        message="You caught all the words!"
        emoji={<Trophy weight="duotone" size={72} color="#FFD54F" />}
        onDismiss={() => setShowFinal(false)}
        navigateBack
      />
    </motion.div>
  );
}
