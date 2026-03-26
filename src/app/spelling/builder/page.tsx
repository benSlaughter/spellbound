'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '@/components/ui/BackButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import Button from '@/components/ui/Button';
import { playSound } from '@/lib/sounds';
import Link from 'next/link';

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

const KEYBOARD_ROWS = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  'ZXCVBNM'.split(''),
];

const KEY_COLORS: Record<string, string> = {};
const PALETTE = ['bg-primary-light', 'bg-accent-light', 'bg-secondary', 'bg-fun-orange', 'bg-fun-purple', 'bg-fun-pink'];
'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').forEach((letter, i) => {
  KEY_COLORS[letter] = PALETTE[i % PALETTE.length];
});

function getEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

function speakWord(word: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.75;
  utterance.pitch = 1.0;
  utterance.lang = 'en-GB';
  window.speechSynthesis.speak(utterance);
}

export default function BuilderPage() {
  const [list, setList] = useState<SpellingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [noList, setNoList] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [builtLetters, setBuiltLetters] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [usedHelp, setUsedHelp] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [showFinal, setShowFinal] = useState(false);
  const [shakePos, setShakePos] = useState(false);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const [autoFilling, setAutoFilling] = useState(false);
  const ctxRef = useRef<{ list: SpellingList; wordIndex: number } | null>(null);

  useEffect(() => {
    if (list) ctxRef.current = { list, wordIndex };
  });

  const resetWord = () => {
    setBuiltLetters([]);
    setWrongAttempts(0);
    setUsedHelp(false);
    setIsCorrect(false);
    setShakePos(false);
    setShakeKey(null);
    setAutoFilling(false);
  };

  useEffect(() => {
    fetch('/api/spellings?active=true')
      .then((res) => res.json())
      .then((data: SpellingList[]) => {
        if (data.length > 0 && data[0].words.length > 0) {
          setList(data[0]);
          // Speak the first word after a short delay
          setTimeout(() => speakWord(data[0].words[0].word), 500);
        } else {
          setNoList(true);
        }
      })
      .catch(() => setNoList(true))
      .finally(() => setLoading(false));
  }, []);

  const currentWord = list?.words[wordIndex];

  const advanceToNext = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx && ctx.wordIndex < ctx.list.words.length - 1) {
      const nextIdx = ctx.wordIndex + 1;
      setWordIndex(nextIdx);
      resetWord();
      setTimeout(() => speakWord(ctx.list.words[nextIdx].word), 500);
    } else {
      setShowFinal(true);
    }
  }, []);

  const handleLetterPress = useCallback((letter: string) => {
    if (!currentWord || isCorrect || autoFilling) return;

    const pos = builtLetters.length;
    const expected = currentWord.word[pos]?.toUpperCase();

    if (letter === expected) {
      playSound('pop');
      const newBuilt = [...builtLetters, letter];
      setBuiltLetters(newBuilt);
      setWrongAttempts(0);

      if (newBuilt.length === currentWord.word.length) {
        setIsCorrect(true);
        setEncouragement(getEncouragement());
        playSound('success');

        const result = usedHelp ? 'helped' : 'correct';
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity_type: 'spelling_builder',
            activity_ref: currentWord.word,
            result,
          }),
        }).then(() => fetch('/api/achievements', { method: 'POST' }));

        setTimeout(advanceToNext, 2000);
      }
    } else {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      setShakePos(true);
      setShakeKey(letter);
      setTimeout(() => {
        setShakePos(false);
        setShakeKey(null);
      }, 500);

      if (newAttempts >= 3) {
        setAutoFilling(true);
        setUsedHelp(true);
        playSound('pop');
        setTimeout(() => {
          const newBuilt = [...builtLetters, expected];
          setBuiltLetters(newBuilt);
          setWrongAttempts(0);
          setAutoFilling(false);

          if (newBuilt.length === currentWord.word.length) {
            setIsCorrect(true);
            setEncouragement(getEncouragement());
            playSound('success');
            fetch('/api/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                activity_type: 'spelling_builder',
                activity_ref: currentWord.word,
                result: 'helped',
              }),
            }).then(() => fetch('/api/achievements', { method: 'POST' }));
            setTimeout(advanceToNext, 2000);
          }
        }, 400);
      }
    }
  }, [currentWord, isCorrect, autoFilling, builtLetters, wrongAttempts, usedHelp, advanceToNext]);

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
        <BackButton />
        <div className="game-card p-10 text-center max-w-md">
          <span className="text-6xl block mb-4">🌱</span>
          <h2 className="text-2xl font-extrabold text-garden-text mb-3">No words to practise!</h2>
          <p className="text-garden-text-light text-lg mb-6">Add some spelling words first!</p>
          <Link href="/entry" className="btn-primary text-lg px-8 py-3 no-underline">
            ✏️ Add Words
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <BackButton />
        <div className="bg-primary-light/20 px-4 py-2 rounded-full font-bold text-garden-text">
          {wordIndex + 1} of {list.words.length} words
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-garden-text">
          🔊 Word Builder
        </h1>
        <p className="mt-1 text-garden-text-light">
          Listen and spell the word!
        </p>
      </div>

      {/* Hear the Word */}
      <div className="flex justify-center gap-3">
        <Button
          variant="primary"
          size="lg"
          emoji="🔊"
          onClick={() => currentWord && speakWord(currentWord.word)}
        >
          Hear the word
        </Button>
      </div>

      {/* Hint */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full text-garden-text font-semibold">
          💡 {currentWord?.hint || 'Can you spell this word?'}
        </span>
      </div>

      {/* Letter Boxes */}
      <div className="game-card p-6">
        <div className="flex flex-wrap justify-center gap-2">
          {currentWord?.word.split('').map((_, index) => {
            const filled = index < builtLetters.length;
            const isCurrentPos = index === builtLetters.length;
            return (
              <motion.div
                key={`${wordIndex}-box-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isCorrect ? [1, 1.15, 1] : 1,
                  x: shakePos && isCurrentPos ? [0, -5, 5, -5, 5, 0] : 0,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  delay: index * 0.05,
                }}
                className={`
                  w-11 h-13 sm:w-13 sm:h-15 rounded-xl text-xl sm:text-2xl font-extrabold
                  flex items-center justify-center border-2
                  ${filled
                    ? isCorrect
                      ? 'bg-primary text-white border-primary'
                      : 'bg-primary-light text-white border-primary-light'
                    : isCurrentPos
                    ? 'border-accent bg-accent-light/20 border-3'
                    : 'border-garden-border bg-garden-card'
                  }
                `}
              >
                {filled ? builtLetters[index] : ''}
              </motion.div>
            );
          })}
        </div>
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
            <span className="text-3xl font-extrabold text-primary">{encouragement}</span>
            <span className="text-3xl ml-2">🌟</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard */}
      {!isCorrect && (
        <div className="game-card p-4">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1.5 mb-1.5">
              {row.map((letter) => (
                <motion.button
                  key={letter}
                  whileTap={{ scale: 0.85 }}
                  animate={{
                    x: shakeKey === letter ? [0, -4, 4, -4, 4, 0] : 0,
                  }}
                  onClick={() => handleLetterPress(letter)}
                  className={`
                    w-9 h-11 sm:w-11 sm:h-13 rounded-lg text-sm sm:text-base font-extrabold
                    text-white shadow-sm cursor-pointer flex items-center justify-center
                    ${KEY_COLORS[letter]}
                    hover:brightness-110 active:brightness-90
                  `}
                >
                  {letter}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Wrong attempts indicator */}
      {wrongAttempts > 0 && !isCorrect && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-garden-text-light font-semibold"
        >
          {wrongAttempts === 1 && 'Not quite — try again! 🌸'}
          {wrongAttempts === 2 && "One more try, you've got this! 💪"}
        </motion.p>
      )}

      <CelebrationOverlay
        show={showFinal}
        message="You practised all your words! 🌟"
        emoji="🏆"
        onDismiss={() => setShowFinal(false)}
      />
    </motion.div>
  );
}
