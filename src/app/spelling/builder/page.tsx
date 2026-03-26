'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import Button from '@/components/ui/Button';
import { playSound } from '@/lib/sounds';
import Link from 'next/link';
import { Plant, PencilSimple, SpeakerHigh, Lightbulb, Sparkle, Trophy } from '@phosphor-icons/react';

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
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Builder />
    </Suspense>
  );
}

function Builder() {
  const searchParams = useSearchParams();
  const [list, setList] = useState<SpellingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [noList, setNoList] = useState(false);
  const [error, setError] = useState(false);
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
  const [hasInteracted, setHasInteracted] = useState(false);
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
    const listId = searchParams.get('listId');
    fetch(listId ? `/api/spellings/${listId}` : '/api/spellings?active=true')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.json();
      })
      .then((raw) => {
        const data: SpellingList[] = Array.isArray(raw) ? raw : [raw];
        if (data.length > 0 && data[0].words.length > 0) {
          setList(data[0]);
        } else {
          setNoList(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const currentWord = list?.words[wordIndex];

  const wordLen = currentWord?.word.length ?? 6;
  const boxSizes = wordLen <= 6
    ? { box: 'w-11 h-13 sm:w-13 sm:h-15', text: 'text-xl sm:text-2xl' }
    : wordLen <= 9
    ? { box: 'w-9 h-11 sm:w-11 sm:h-13', text: 'text-lg sm:text-xl' }
    : { box: 'w-7 h-9 sm:w-9 sm:h-11', text: 'text-base sm:text-lg' };

  const advanceToNext = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx && ctx.wordIndex < ctx.list.words.length - 1) {
      const nextIdx = ctx.wordIndex + 1;
      setWordIndex(nextIdx);
      resetWord();
      // After first interaction, auto-speak subsequent words
      timerRef.current = setTimeout(() => speakWord(ctx.list.words[nextIdx].word), 500);
    } else {
      setShowFinal(true);
    }
  }, []);

  const handleFirstListen = () => {
    if (currentWord) {
      speakWord(currentWord.word);
      setHasInteracted(true);
    }
  };

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
        })
          .then(() => fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' } }))
          .catch((err) => console.error('Failed to record progress:', err));

        timerRef.current = setTimeout(advanceToNext, 2000);
      }
    } else {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      setShakePos(true);
      setShakeKey(letter);
      timerRef.current = setTimeout(() => {
        setShakePos(false);
        setShakeKey(null);
      }, 500);

      if (newAttempts >= 3) {
        setAutoFilling(true);
        setUsedHelp(true);
        playSound('pop');
        timerRef.current = setTimeout(() => {
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
            })
              .then(() => fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' } }))
              .catch((err) => console.error('Failed to record progress:', err));
            timerRef.current = setTimeout(advanceToNext, 2000);
          }
        }, 400);
      }
    }
  }, [currentWord, isCorrect, autoFilling, builtLetters, wrongAttempts, usedHelp, advanceToNext]);

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
      className="flex flex-col gap-5 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <Breadcrumbs />
        <div className="progress-pill">
          {wordIndex + 1} of {list.words.length} words
        </div>
      </div>

      <div className="text-center">
        <h1 className="page-title">
          Word Builder
        </h1>
        <p className="page-subtitle">
          Listen and spell the word!
        </p>
      </div>

      {/* Hear the Word */}
      {!hasInteracted ? (
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0.9 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ type: 'tween', duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Button
            variant="primary"
            size="lg"
            icon={<SpeakerHigh weight="duotone" size={20} />}
            onClick={handleFirstListen}
            className="text-xl px-8 py-4"
          >
            Tap to hear your word!
          </Button>
        </motion.div>
      ) : (
        <div className="flex justify-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={<SpeakerHigh weight="duotone" size={20} />}
            onClick={() => currentWord && speakWord(currentWord.word)}
          >
            Hear Word
          </Button>
        </div>
      )}

      {/* Hint */}
      <div className="text-center">
        <span className="hint-pill">
          <Lightbulb weight="duotone" size={20} color="#FFD54F" /> {currentWord?.hint || 'Can you spell this word?'}
        </span>
      </div>

      {/* Letter Boxes + Keyboard */}
      <div className="flex flex-col md:flex-row md:gap-6">
      {/* Letter Boxes */}
      <div className="game-card p-6 md:flex-1">
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
                  scale: isCorrect ? 1.15 : 1,
                  x: shakePos && isCurrentPos ? [0, -5, 5, -5, 5, 0] : 0,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  delay: index * 0.05,
                }}
                className={`
                  ${boxSizes.box} rounded-xl ${boxSizes.text} font-extrabold
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

      {/* Keyboard */}
      {!isCorrect && (
        <div className="game-card p-4 md:flex-1">
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

          </motion.div>
        )}
      </AnimatePresence>

      {/* Wrong attempts indicator */}
      {wrongAttempts > 0 && !isCorrect && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-garden-text-light font-semibold"
        >
          {wrongAttempts === 1 && 'Not quite — try again!'}
          {wrongAttempts === 2 && "One more try, you've got this!"}
        </motion.p>
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
