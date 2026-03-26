'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import Button from '@/components/ui/Button';
import { playSound, speakWord } from '@/lib/sounds';
import Link from 'next/link';
import { Plant, PencilSimple, Lightbulb, Sparkle, Trophy, SpeakerHigh } from '@phosphor-icons/react';

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

const TILE_COLORS = [
  'bg-primary-light', 'bg-accent-light', 'bg-secondary',
  'bg-fun-orange', 'bg-fun-purple', 'bg-fun-pink',
  'bg-primary', 'bg-accent',
];

type Tile = { letter: string; id: number };

/** Returns responsive tile size classes based on word length. */
function tileSize(wordLength: number): { tile: string; text: string; empty: string } {
  if (wordLength <= 6) {
    return {
      tile: 'w-12 h-12 sm:w-14 sm:h-14',
      text: 'text-xl sm:text-2xl',
      empty: 'w-12 h-12 sm:w-14 sm:h-14',
    };
  }
  if (wordLength <= 9) {
    return {
      tile: 'w-10 h-10 sm:w-12 sm:h-12',
      text: 'text-lg sm:text-xl',
      empty: 'w-10 h-10 sm:w-12 sm:h-12',
    };
  }
  return {
    tile: 'w-8 h-8 sm:w-10 sm:h-10',
    text: 'text-base sm:text-lg',
    empty: 'w-8 h-8 sm:w-10 sm:h-10',
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

function makeScramble(word: string): Tile[] {
  const letters = word.split('').map((letter, i) => ({ letter, id: i }));
  let shuffled = shuffleArray(letters);
  let attempts = 0;
  while (shuffled.map((l) => l.letter).join('') === word && attempts < 10) {
    shuffled = shuffleArray(letters);
    attempts++;
  }
  return shuffled;
}

export default function ScramblePage() {
  const [list, setList] = useState<SpellingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [noList, setNoList] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<Tile[]>([]);
  const [answer, setAnswer] = useState<Tile[]>([]);
  const [usedHint, setUsedHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [showFinal, setShowFinal] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const ctxRef = useRef<{ list: SpellingList; wordIndex: number } | null>(null);
  const hintRef = useRef(false);

  // Keep refs in sync for use in timeout callbacks
  useEffect(() => {
    if (list) ctxRef.current = { list, wordIndex };
  });
  useEffect(() => {
    hintRef.current = usedHint;
  }, [usedHint]);

  const resetWord = (word: string) => {
    setScrambledLetters(makeScramble(word));
    setAnswer([]);
    setUsedHint(false);
    setIsCorrect(false);
    setRevealedCount(0);
    setHintCount(0);
  };

  useEffect(() => {
    const listId = new URLSearchParams(window.location.search).get('listId'); fetch(listId ? `/api/spellings/${listId}` : '/api/spellings?active=true')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.json();
      })
      .then((raw) => { const data: SpellingList[] = Array.isArray(raw) ? raw : [raw];
        if (data.length > 0 && data[0].words.length > 0) {
          setList(data[0]);
          // Initialize first word
          setScrambledLetters(makeScramble(data[0].words[0].word));
        } else {
          setNoList(true);
        }
      })
      .catch(() => setNoList(true))
      .finally(() => setLoading(false));
  }, []);

  const currentWord = list?.words[wordIndex];
  const sizes = tileSize(currentWord?.word.length ?? 6);

  const checkAndRecordAnswer = (newAnswer: Tile[], word: string) => {
    if (newAnswer.length !== word.length) return;
    const spelled = newAnswer.map((t) => t.letter).join('');
    if (spelled !== word) return;

    setIsCorrect(true);
    setEncouragement(getEncouragement());
    playSound('success');

    // Read hint state from ref for accurate recording
    const result = hintRef.current ? 'helped' : 'correct';
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity_type: 'spelling_scramble',
        activity_ref: word,
        result,
      }),
    })
      .then(() => fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' } }))
      .catch((err) => console.error('Failed to record progress:', err));

    setTimeout(() => {
      // Read current state from ref at timeout fire time
      const ctx = ctxRef.current;
      if (ctx && ctx.wordIndex < ctx.list.words.length - 1) {
        const nextIdx = ctx.wordIndex + 1;
        setWordIndex(nextIdx);
        resetWord(ctx.list.words[nextIdx].word);
      } else {
        setShowFinal(true);
      }
    }, 2000);
  };

  const selectLetter = (tile: Tile) => {
    if (isCorrect || !currentWord) return;
    playSound('click');
    const newScrambled = scrambledLetters.filter((t) => t.id !== tile.id);
    const newAnswer = [...answer, tile];
    setScrambledLetters(newScrambled);
    setAnswer(newAnswer);

    checkAndRecordAnswer(newAnswer, currentWord.word);
  };

  const removeLetter = (tile: Tile, index: number) => {
    if (isCorrect) return;
    if (index < revealedCount) return;
    playSound('click');
    setAnswer((prev) => prev.filter((t) => t.id !== tile.id));
    setScrambledLetters((prev) => [...prev, tile]);
  };

  const useHint = () => {
    if (!currentWord || isCorrect || hintCount >= 3) return;
    setUsedHint(true);
    setHintCount((prev) => prev + 1);
    playSound('pop');

    const word = currentWord.word;
    const nextIndex = answer.length;
    if (nextIndex >= word.length) return;

    const targetLetter = word[nextIndex];
    const tileIndex = scrambledLetters.findIndex((t) => t.letter === targetLetter);
    if (tileIndex >= 0) {
      const tile = scrambledLetters[tileIndex];
      const newScrambled = scrambledLetters.filter((t) => t.id !== tile.id);
      const newAnswer = [...answer, tile];
      setScrambledLetters(newScrambled);
      setAnswer(newAnswer);
      setRevealedCount((prev) => prev + 1);

      checkAndRecordAnswer(newAnswer, currentWord.word);
    }
  };

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
          <span className="text-6xl block mb-4"><Plant weight="duotone" size={64} color="#66BB6A" /></span>
          <h2 className="text-2xl font-extrabold text-garden-text mb-3">No words to practise!</h2>
          <p className="text-garden-text-light text-lg mb-6">Add some spelling words first!</p>
          <Link href="/entry" className="btn-primary text-lg px-8 py-3 no-underline inline-flex items-center gap-2">
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
      className="flex flex-col gap-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <Breadcrumbs />
        <div className="progress-pill">
          {wordIndex + 1} of {list.words.length} words
        </div>
      </div>

      <div className="text-center">
        <h1 className="page-title">
          Word Scramble
        </h1>
        <p className="page-subtitle">
          Put the letters in the right order!
        </p>
      </div>

      {/* Answer + Scrambled Letters */}
      <div className="flex flex-col md:flex-row md:gap-6">
      {/* Answer Area */}
      <div className="game-card p-6 md:flex-1">
        <p className="text-sm font-bold text-garden-text-light mb-3 text-center">
          Your answer:
        </p>
        <div className="flex flex-wrap justify-center gap-2 min-h-[64px]">
          <AnimatePresence mode="popLayout">
            {answer.map((tile, index) => (
              <motion.button
                key={`answer-${tile.id}`}
                layout
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: isCorrect ? 1.15 : 1,
                  backgroundColor: isCorrect ? '#4CAF50' : undefined,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                onClick={() => removeLetter(tile, index)}
                className={`
                  ${sizes.tile} rounded-xl ${sizes.text} font-extrabold
                  text-white shadow-md flex items-center justify-center
                  ${index < revealedCount ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                  ${isCorrect ? 'bg-primary' : TILE_COLORS[tile.id % TILE_COLORS.length]}
                `}
                disabled={isCorrect || index < revealedCount}
              >
                {tile.letter.toUpperCase()}
              </motion.button>
            ))}
            {/* Empty slots */}
            {currentWord &&
              Array.from({ length: currentWord.word.length - answer.length }).map((_, i) => (
                <motion.div
                  key={`empty-${i}`}
                  layout
                  className={`${sizes.empty} rounded-xl border-2 border-dashed border-garden-border`}
                />
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Scrambled Letters */}
      <div className="game-card p-6 md:flex-1">
        <p className="text-sm font-bold text-garden-text-light mb-3 text-center">
          Available letters:
        </p>
        <div className="flex flex-wrap justify-center gap-2 min-h-[64px]">
          <AnimatePresence mode="popLayout">
            {scrambledLetters.map((tile) => (
              <motion.button
                key={`scramble-${tile.id}`}
                layout
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                onClick={() => selectLetter(tile)}
                className={`
                  ${sizes.tile} rounded-xl ${sizes.text} font-extrabold
                  text-white shadow-md cursor-pointer flex items-center justify-center
                  ${TILE_COLORS[tile.id % TILE_COLORS.length]}
                `}
              >
                {tile.letter.toUpperCase()}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
      </div>

      {/* Encouragement Message */}
      <AnimatePresence>
        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="feedback-container"
          >
            <span className="msg-encouragement">{encouragement}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word hint + audio */}
      {currentWord && !isCorrect && (
        <div className="flex flex-col items-center gap-3">
          {currentWord.hint && (
            <span className="hint-pill">
              <Lightbulb weight="duotone" size={20} color="#FFD54F" /> {currentWord.hint}
            </span>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" size="md" icon={<SpeakerHigh weight="duotone" size={20} />} onClick={() => speakWord(currentWord.word)}>
              Hear Word
            </Button>
            <Button variant="secondary" size="md" icon={<Lightbulb weight="duotone" size={20} />} onClick={useHint} disabled={hintCount >= 3}>
              Hint ({3 - hintCount})
            </Button>
          </div>
        </div>
      )}

      <CelebrationOverlay
        show={showFinal}
        message="You practised all your words!"
        emoji={<Trophy weight="duotone" size={72} color="#FFD54F" />}
        onDismiss={() => setShowFinal(false)}
        navigateBack
      />
    </motion.div>
  );
}
