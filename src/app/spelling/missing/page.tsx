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

function getEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

interface LetterSlot {
  letter: string;
  isBlank: boolean;
  filled: boolean;
  index: number;
}

function generateBlanks(word: string): LetterSlot[] {
  const len = word.length;
  let numBlanks = 1;
  if (len >= 5) numBlanks = 2;
  if (len >= 8) numBlanks = 3;

  const candidatePositions = Array.from({ length: len }, (_, i) => i).filter((i) => i > 0);
  const shuffled = candidatePositions.sort(() => Math.random() - 0.5);
  const blankPositions = new Set(shuffled.slice(0, numBlanks));

  return word.split('').map((letter, index) => ({
    letter,
    isBlank: blankPositions.has(index),
    filled: !blankPositions.has(index),
    index,
  }));
}

export default function MissingLettersPage() {
  const [list, setList] = useState<SpellingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [noList, setNoList] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [slots, setSlots] = useState<LetterSlot[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);
  const [showFinal, setShowFinal] = useState(false);
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const ctxRef = useRef<{ list: SpellingList; wordIndex: number } | null>(null);
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

  const resetWord = (word: string) => {
    setSlots(generateBlanks(word));
    setIsCorrect(false);
    setShakeIdx(null);
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
          setSlots(generateBlanks(data[0].words[0].word));
        } else {
          setNoList(true);
        }
      })
      .catch(() => setNoList(true))
      .finally(() => setLoading(false));
  }, []);

  const currentWord = list?.words[wordIndex];

  /** Returns responsive tile size classes based on word length. */
  const wordLen = currentWord?.word.length ?? 6;
  const tileSizes = wordLen <= 6
    ? { tile: 'w-12 h-14 sm:w-14 sm:h-16', text: 'text-2xl' }
    : wordLen <= 9
    ? { tile: 'w-10 h-12 sm:w-12 sm:h-14', text: 'text-xl' }
    : { tile: 'w-8 h-10 sm:w-10 sm:h-12', text: 'text-lg' };

  // Focus the next blank input
  useEffect(() => {
    if (slots.length > 0 && !isCorrect) {
      const blanks = slots.filter((s) => s.isBlank && !s.filled);
      if (blanks.length > 0) {
        const ref = inputRefs.current.get(blanks[0].index);
        ref?.focus();
      }
    }
  }, [slots, isCorrect]);

  const handleInput = (slotIndex: number, value: string) => {
    if (isCorrect || !currentWord) return;
    const char = value.slice(-1).toLowerCase();
    if (!char) return;

    const slot = slots[slotIndex];
    if (char === slot.letter) {
      playSound('pop');
      const newSlots = [...slots];
      newSlots[slotIndex] = { ...slot, filled: true };
      setSlots(newSlots);

      const allFilled = newSlots.every((s) => s.filled);
      if (allFilled) {
        setIsCorrect(true);
        setEncouragement(getEncouragement());
        playSound('success');

        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity_type: 'spelling_missing',
            activity_ref: currentWord.word,
            result: 'correct',
          }),
        })
          .then(() => fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' } }))
          .catch((err) => console.error('Failed to record progress:', err));

        timerRef.current = setTimeout(() => {
          const ctx = ctxRef.current;
          if (ctx && ctx.wordIndex < ctx.list.words.length - 1) {
            const nextIdx = ctx.wordIndex + 1;
            setWordIndex(nextIdx);
            resetWord(ctx.list.words[nextIdx].word);
          } else {
            setShowFinal(true);
          }
        }, 2000);
      } else {
        // Focus next blank
        const nextBlank = newSlots.find((s, i) => i > slotIndex && s.isBlank && !s.filled);
        const fallbackBlank = newSlots.find((s) => s.isBlank && !s.filled);
        const target = nextBlank || fallbackBlank;
        if (target) {
          const ref = inputRefs.current.get(target.index);
          ref?.focus();
        }
      }
    } else {
      setShakeIdx(slotIndex);
      timerRef.current = setTimeout(() => setShakeIdx(null), 500);
      const ref = inputRefs.current.get(slotIndex);
      if (ref) ref.value = '';
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
          Missing Letters
        </h1>
        <p className="page-subtitle">
          Fill in the missing letters!
        </p>
      </div>

      {/* Word Display */}
      <div className="game-card p-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          <AnimatePresence mode="popLayout">
            {slots.map((slot) => (
              <motion.div
                key={`${wordIndex}-${slot.index}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isCorrect ? 1.15 : 1,
                  x: shakeIdx === slot.index ? [0, -6, 6, -6, 6, 0] : 0,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 300,
                  delay: slot.index * 0.05,
                }}
                className="relative"
              >
                {slot.isBlank && !slot.filled ? (
                  <input
                    ref={(el) => {
                      if (el) inputRefs.current.set(slot.index, el);
                    }}
                    type="text"
                    maxLength={1}
                    autoComplete="off"
                    autoCapitalize="off"
                    onChange={(e) => handleInput(slot.index, e.target.value)}
                    className={`
                      ${tileSizes.tile} rounded-xl text-center ${tileSizes.text} font-extrabold
                      border-3 border-accent focus:border-primary focus:outline-none
                      bg-accent-light/20 text-garden-text uppercase
                      ${shakeIdx === slot.index ? 'border-error bg-error/10' : ''}
                    `}
                  />
                ) : (
                  <motion.div
                    initial={slot.isBlank ? { scale: 0.5, rotate: -10 } : {}}
                    animate={slot.isBlank ? { scale: 1, rotate: 0 } : {}}
                    className={`
                      ${tileSizes.tile} rounded-xl text-center ${tileSizes.text} font-extrabold
                      flex items-center justify-center
                      ${isCorrect
                        ? 'bg-primary text-white'
                        : slot.isBlank
                        ? 'bg-primary-light text-white'
                        : 'bg-garden-card border-2 border-garden-border text-garden-text'}
                    `}
                  >
                    {slot.letter.toUpperCase()}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Hint + Hear word */}
      {currentWord && !isCorrect && (
        <div className="flex flex-col items-center gap-3">
          {currentWord.hint && (
            <span className="hint-pill">
              <Lightbulb weight="duotone" size={20} color="#FFD54F" /> {currentWord.hint}
            </span>
          )}
          <Button variant="secondary" size="md" icon={<SpeakerHigh weight="duotone" size={20} />} onClick={() => speakWord(currentWord.word)}>
            Hear Word
          </Button>
        </div>
      )}

      {/* Encouragement */}
      <AnimatePresence>
        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="feedback-container"
          >
            <span className="msg-encouragement">{encouragement}</span>
            <Sparkle weight="duotone" size={28} color="#FFD54F" />
          </motion.div>
        )}
      </AnimatePresence>

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
