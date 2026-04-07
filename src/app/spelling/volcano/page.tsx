'use client';

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { recordProgress, smartWordOrder } from '@/lib/utils';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import Button from '@/components/ui/Button';
import { playSound, speakWord } from '@/lib/sounds';
import Link from 'next/link';
import { Plant, PencilSimple, SpeakerHigh, Mountains, Trophy } from '@phosphor-icons/react';

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

const ENCOURAGEMENTS = [
  'Amazing!', 'Brilliant!', 'Wonderful!', 'Super star!',
  'Keep it up!', "You're doing great!", 'Fantastic!', 'Well done!',
];

const DECOY_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function getEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

/** Scatter positions in a grid-like pattern with jitter to avoid overlaps. */
function scatterPositions(count: number): { top: string; left: string }[] {
  const positions: { top: number; left: number }[] = [];
  for (let i = 0; i < count; i++) {
    let top: number, left: number;
    let attempts = 0;
    do {
      top = 5 + Math.random() * 62;
      left = 5 + Math.random() * 82;
      attempts++;
    } while (
      attempts < 50 &&
      positions.some((p) => Math.abs(p.top - top) < 12 && Math.abs(p.left - left) < 12)
    );
    positions.push({ top, left });
  }
  return positions.map((p) => ({
    top: `${p.top}%`,
    left: `${p.left}%`,
  }));
}

/** Pick decoy letters that aren't already in the word. */
function pickDecoys(word: string, count: number): string[] {
  const wordLetters = new Set(word.toUpperCase().split(''));
  const available = DECOY_LETTERS.split('').filter((l) => !wordLetters.has(l));
  const decoys: string[] = [];
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    decoys.push(available.splice(idx, 1)[0]);
  }
  return decoys;
}

interface RockTile {
  id: string;
  letter: string;
  isDecoy: boolean;
  position: { top: string; left: string };
}

function buildRocks(word: string): RockTile[] {
  const letters = word.toUpperCase().split('');
  const decoys = pickDecoys(word, Math.min(3, Math.max(2, Math.floor(Math.random() * 2) + 2)));
  const all = [
    ...letters.map((l, i) => ({ letter: l, isDecoy: false, uid: `w-${i}` })),
    ...decoys.map((l, i) => ({ letter: l, isDecoy: true, uid: `d-${i}` })),
  ];
  // Shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const positions = scatterPositions(all.length);
  return all.map((item, idx) => ({
    id: item.uid,
    letter: item.letter,
    isDecoy: item.isDecoy,
    position: positions[idx],
  }));
}

export default function VolcanoPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Volcano />
    </Suspense>
  );
}

function Volcano() {
  const searchParams = useSearchParams();
  const [list, setList] = useState<SpellingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [noList, setNoList] = useState(false);
  const [error, setError] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [filledCount, setFilledCount] = useState(0);
  const [lavaHeight, setLavaHeight] = useState(5);
  const [rocks, setRocks] = useState<RockTile[]>([]);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [showFinal, setShowFinal] = useState(false);

  const ctxRef = useRef<{ list: SpellingList; wordIndex: number } | null>(null);
  const lavaRef = useRef(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up speech and timers on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (list) ctxRef.current = { list, wordIndex };
  });

  // Fetch spelling list
  useEffect(() => {
    const listId = searchParams.get('listId');
    fetch(listId ? `/api/spellings/${listId}` : '/api/spellings?active=true')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.json();
      })
      .then(async (raw) => {
        const data: SpellingList[] = Array.isArray(raw) ? raw : [raw];
        if (data.length > 0 && data[0].words.length > 0) {
          const ordered = await smartWordOrder(data[0].words);
          setList({ ...data[0], words: ordered });
          setRocks(buildRocks(ordered[0].word));
        } else {
          setNoList(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Lava timer — rises by 2% every 3 seconds
  useEffect(() => {
    if (!list || isCorrect) return;
    const interval = setInterval(() => {
      setLavaHeight((prev) => {
        const next = Math.min(60, prev + 2);
        lavaRef.current = next;
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [list, wordIndex, isCorrect]);

  const currentWord = list?.words[wordIndex];
  const wordLetters = useMemo(
    () => (currentWord ? currentWord.word.toUpperCase().split('') : []),
    [currentWord]
  );

  const resetForWord = useCallback((word: string) => {
    setFilledCount(0);
    setLavaHeight(5);
    lavaRef.current = 5;
    setRemovedIds(new Set());
    setShakingId(null);
    setIsCorrect(false);
    setRocks(buildRocks(word));
  }, []);

  const advanceToNext = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx && ctx.wordIndex < ctx.list.words.length - 1) {
      const nextIdx = ctx.wordIndex + 1;
      setWordIndex(nextIdx);
      resetForWord(ctx.list.words[nextIdx].word);
      timerRef.current = setTimeout(() => speakWord(ctx.list.words[nextIdx].word), 500);
    } else {
      setShowFinal(true);
    }
  }, [resetForWord]);

  const handleRockClick = useCallback(
    (rock: RockTile) => {
      if (isCorrect || removedIds.has(rock.id)) return;

      const expected = wordLetters[filledCount];
      if (rock.letter === expected && !rock.isDecoy) {
        // Find the first non-removed rock whose letter matches expected AND isn't a decoy
        // We need to make sure it's actually a word rock matching the current position
        playSound('success');
        const newRemoved = new Set(removedIds);
        newRemoved.add(rock.id);
        setRemovedIds(newRemoved);
        const newFilled = filledCount + 1;
        setFilledCount(newFilled);

        if (newFilled === wordLetters.length) {
          setIsCorrect(true);
          setEncouragement(getEncouragement());
          playSound('achievement');

          if (currentWord) {
            recordProgress('spelling_volcano', currentWord.word, 'correct');
          }

          timerRef.current = setTimeout(advanceToNext, 2000);
        }
      } else {
        // Wrong letter — shake the rock
        playSound('pop');
        setShakingId(rock.id);
        timerRef.current = setTimeout(() => setShakingId(null), 500);
      }
    },
    [isCorrect, removedIds, filledCount, wordLetters, currentWord, advanceToNext]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Breadcrumbs />
        <LoadingSpinner />
        <p className="text-garden-text-light font-semibold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Breadcrumbs />
        <div className="game-card p-10 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-extrabold text-garden-text mb-3">
            Oops! Could not load words
          </h2>
          <p className="text-garden-text-light text-lg">
            Something went wrong. Try going back and trying again!
          </p>
        </div>
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
          <span className="text-6xl block mb-4">
            <Plant weight="duotone" size={64} color="#66BB6A" />
          </span>
          <h2 className="text-2xl font-extrabold text-garden-text mb-3">No words to practise!</h2>
          <p className="text-garden-text-light text-lg mb-6">Add some spelling words first!</p>
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
      className="flex flex-col gap-5 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <Breadcrumbs />
        <div className="progress-pill">
          {wordIndex + 1} of {list.words.length} words
        </div>
      </div>

      <div className="text-center">
        <h1 className="page-title flex items-center justify-center gap-2">
          <Mountains weight="duotone" size={36} color="#BF360C" />
          Word Volcano
        </h1>
        <p className="page-subtitle">Tap the letters in order to spell the word!</p>
      </div>

      {/* Hear word button */}
      <div className="flex justify-center">
        <Button
          variant="secondary"
          size="md"
          icon={<SpeakerHigh weight="duotone" size={20} />}
          onClick={() => currentWord && speakWord(currentWord.word)}
        >
          Hear Word
        </Button>
      </div>

      {/* Word progress */}
      <div className="flex justify-center">
        <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-2xl flex gap-2">
          {wordLetters.map((letter, idx) => {
            const filled = idx < filledCount;
            return (
              <motion.div
                key={`slot-${wordIndex}-${idx}`}
                animate={{
                  scale: filled ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`
                  w-10 h-12 sm:w-12 sm:h-14 rounded-lg flex items-center justify-center
                  text-xl sm:text-2xl font-extrabold border-2
                  ${
                    filled
                      ? 'bg-green-500 border-green-400 text-white'
                      : 'bg-white/10 border-white/30 text-white/30'
                  }
                `}
              >
                {filled ? letter : '_'}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Volcano scene */}
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-lg"
        style={{
          height: '450px',
          background:
            'linear-gradient(180deg, #546E7A 0%, #795548 40%, #BF360C 70%, #D84315 100%)',
        }}
      >
        {/* Volcano shape — CSS triangle */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '120px solid transparent',
            borderRight: '120px solid transparent',
            borderBottom: '200px solid #4E342E',
          }}
        />
        {/* Volcano glow highlight */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '60px solid transparent',
            borderRight: '60px solid transparent',
            borderBottom: '100px solid #6D4C41',
            opacity: 0.6,
          }}
        />

        {/* Lava */}
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-red-600 to-orange-400 opacity-80"
          style={{
            height: `${lavaHeight}%`,
            transition: 'height 1s ease-in-out',
          }}
        />

        {/* Letter rocks */}
        <AnimatePresence>
          {rocks.map((rock) => {
            if (removedIds.has(rock.id)) return null;
            const isShaking = shakingId === rock.id;
            return (
              <motion.button
                key={rock.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: isShaking ? 6 : 0,
                }}
                exit={{ opacity: 0, scale: 0, y: -20 }}
                transition={isShaking
                  ? { x: { type: 'tween', duration: 0.08, repeat: 5, repeatType: 'mirror' as const } }
                  : { type: 'spring', damping: 15, stiffness: 300 }
                }
                onClick={() => handleRockClick(rock)}
                className="absolute w-14 h-14 sm:w-16 sm:h-16
                  bg-gradient-to-br from-stone-500 via-stone-600 to-stone-800
                  text-white font-bold text-xl sm:text-2xl
                  flex items-center justify-center
                  cursor-pointer shadow-xl
                  border-2 border-stone-400/40
                  hover:brightness-110 active:scale-90
                  select-none z-10 uppercase"
                style={{
                  top: rock.position.top,
                  left: rock.position.left,
                  borderRadius: '38% 62% 52% 48% / 45% 55% 45% 55%',
                  textShadow: '1px 2px 3px rgba(0,0,0,0.5)',
                  boxShadow: '2px 3px 8px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.15)',
                }}
              >
                {rock.letter}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Encouragement */}
      <AnimatePresence>
        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <span className="msg-encouragement">{encouragement}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <CelebrationOverlay
        show={showFinal}
        message="You conquered the volcano!"
        emoji={<Trophy weight="duotone" size={72} color="#FFD54F" />}
        onDismiss={() => setShowFinal(false)}
        navigateBack
      />
    </motion.div>
  );
}
