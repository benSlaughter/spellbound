'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightning, Star, SpeakerHigh, LightbulbFilament } from '@phosphor-icons/react';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import { playSound, speakWord } from '@/lib/sounds';
import { recordProgress, shuffle } from '@/lib/utils';
import { makeShuffledAnswers } from '@/lib/maths-helpers';

interface ChallengeQuestion {
  type: 'spelling' | 'maths';
  format: 'type' | 'missing' | 'scramble' | 'multiple_choice';
  word?: string;
  hint?: string | null;
  question?: string;
  answer?: number;
  ref: string;
}

const ENCOURAGEMENTS = [
  'Brilliant!', 'You got it!', 'Amazing!', 'Well done!',
  'Fantastic!', 'Super star!', 'Wonderful!', 'Keep going!',
];

const WRONG_ENCOURAGEMENTS = [
  "Don't worry, try again!",
  "It's ok — you're learning!",
  "Nearly there, have another go!",
  "Keep going, you've got this!",
  "Not quite — give it another try!",
  "That's ok, learning takes practice!",
];

function randomEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

function randomWrongEncouragement() {
  return WRONG_ENCOURAGEMENTS[Math.floor(Math.random() * WRONG_ENCOURAGEMENTS.length)];
}

export default function ChallengePage() {
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [finished, setFinished] = useState(false);

  // Shared question state
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Scramble state
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [scrambleAnswer, setScrambleAnswer] = useState<string[]>([]);

  // Missing letters state
  const [missingSlots, setMissingSlots] = useState<{ char: string; isBlank: boolean; filled: string }[]>([]);

  // Maths state
  const [mathChoices, setMathChoices] = useState<number[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    fetch('/api/challenge')
      .then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); })
      .then(data => {
        if (data.questions?.length > 0) {
          setQuestions(data.questions);
          setupQuestion(data.questions[0]);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setupQuestion(q: ChallengeQuestion) {
    setFeedback(null);
    setIsCorrect(false);
    setShake(false);
    setAttempts(0);
    setScrambleAnswer([]);

    if (q.type === 'spelling' && q.word) {
      // Both 'type' and 'scramble' use letter tiles — no text input
      if (q.format === 'type' || q.format === 'scramble') {
        const letters = q.word.split('');
        let shuffled = shuffle(letters);
        while (shuffled.join('') === q.word && letters.length > 1) {
          shuffled = shuffle(letters);
        }
        setScrambledLetters(shuffled);
        setScrambleAnswer([]);
      } else if (q.format === 'missing') {
        const chars = q.word.split('');
        const blankCount = Math.max(2, Math.ceil(chars.length * 0.4));
        const indices = shuffle(chars.map((_, i) => i)).slice(0, blankCount);
        setMissingSlots(chars.map((c, i) => ({
          char: c, isBlank: indices.includes(i), filled: indices.includes(i) ? '' : c,
        })));
      }
    } else if (q.type === 'maths' && q.answer !== undefined) {
      const wrongs: number[] = [];
      while (wrongs.length < 3) {
        const offset = (Math.floor(Math.random() * 10) + 1) * (Math.random() > 0.5 ? 1 : -1);
        const wrong = q.answer + offset;
        if (wrong > 0 && wrong !== q.answer && !wrongs.includes(wrong)) wrongs.push(wrong);
      }
      setMathChoices(makeShuffledAnswers(q.answer, wrongs));
    }
  }

  function handleCorrect(q: ChallengeQuestion) {
    setIsCorrect(true);
    setFeedback(randomEncouragement());
    playSound('success');

    const result = attempts > 0 ? 'helped' : 'correct';
    const activityType = q.type === 'spelling' ? `spelling_challenge` : `maths_challenge`;
    recordProgress(activityType, q.ref, result);

    timerRef.current = setTimeout(() => {
      const nextIdx = currentIdx + 1;
      if (nextIdx >= questions.length) {
        setFinished(true);
        playSound('achievement');
      } else {
        setCurrentIdx(nextIdx);
        setupQuestion(questions[nextIdx]);
      }
    }, 1500);
  }

  function handleWrong() {
    setShake(true);
    setFeedback(randomWrongEncouragement());
    setAttempts(a => a + 1);
    playSound('pop');
    timerRef.current = setTimeout(() => {
      setShake(false);
      setFeedback(null);
    }, 1500);
  }

  // --- Spelling: Scramble ---
  function handleScrambleTap(letter: string, idx: number) {
    const newAnswer = [...scrambleAnswer, letter];
    setScrambleAnswer(newAnswer);
    const newLetters = [...scrambledLetters];
    newLetters.splice(idx, 1);
    setScrambledLetters(newLetters);

    const q = questions[currentIdx];
    if (newAnswer.length === q.word?.length) {
      if (newAnswer.join('') === q.word) {
        handleCorrect(q);
      } else {
        handleWrong();
        // Reset scramble
        const letters = q.word!.split('');
        setScrambledLetters(shuffle(letters));
        setScrambleAnswer([]);
      }
    }
  }

  // --- Spelling: Missing ---
  function handleMissingInput(idx: number, value: string) {
    const newSlots = [...missingSlots];
    newSlots[idx] = { ...newSlots[idx], filled: value.toLowerCase() };
    setMissingSlots(newSlots);

    const q = questions[currentIdx];
    const allFilled = newSlots.filter(s => s.isBlank).every(s => s.filled);
    if (allFilled) {
      const attempt = newSlots.map(s => s.filled || s.char).join('');
      if (attempt === q.word) {
        handleCorrect(q);
      } else {
        handleWrong();
      }
    }
  }

  // --- Maths ---
  function handleMathsChoice(choice: number, q: ChallengeQuestion) {
    if (choice === q.answer) {
      handleCorrect(q);
    } else {
      handleWrong();
    }
  }

  if (loading) return <div className="page-container"><LoadingSpinner /></div>;
  if (error || questions.length === 0) {
    return (
      <div className="page-container text-center py-20">
        <Lightning weight="duotone" size={48} className="mx-auto text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-garden-text mb-2">No challenge ready yet!</h2>
        <p className="text-garden-text-light">Play some spelling and maths games first, then come back for a challenge.</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="page-container max-w-lg mx-auto text-center py-12">
        <CelebrationOverlay
          message="Challenge Complete!"
          navigateBack
        />
        <Lightning weight="duotone" size={64} className="mx-auto text-amber-400 mb-4" />
        <h1 className="text-2xl font-extrabold text-garden-text mb-2">Challenge Complete!</h1>
        <p className="text-garden-text-light mb-6">
          Brilliant work — you practised {questions.length} questions!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full transition-colors text-lg"
        >
          Back to the Garden
        </Link>
      </div>
    );
  }

  const q = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="page-container max-w-lg mx-auto">
      <Breadcrumbs />

      <div className="text-center mb-6">
        <h1 className="page-title flex items-center justify-center gap-2">
          <Lightning weight="duotone" size={28} className="text-amber-400" />
          Daily Challenge
        </h1>
        <p className="text-garden-text-light">
          Question {currentIdx + 1} of {questions.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-stone-200 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className={`question-card p-6 ${shake ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}
        >
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
              q.type === 'spelling'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {q.type === 'spelling' ? 'Spelling' : 'Maths'}
            </span>
            {q.hint && (
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <LightbulbFilament weight="duotone" size={14} />
                {q.hint}
              </span>
            )}
          </div>

          {/* === SPELLING: TYPE (letter tiles) === */}
          {q.type === 'spelling' && q.format === 'type' && (
            <div className="text-center">
              <button
                onClick={() => q.word && speakWord(q.word)}
                className="mx-auto mb-4 flex items-center gap-2 px-4 py-2 bg-primary-light/20 rounded-full text-primary font-bold hover:bg-primary-light/30 transition-colors"
              >
                <SpeakerHigh weight="duotone" size={20} />
                Hear the word
              </button>
              <p className="text-sm text-stone-500 mb-3">Tap the letters in order:</p>
              <div className="flex flex-wrap justify-center gap-2 mb-4 min-h-[44px]">
                {scrambleAnswer.map((l, i) => (
                  <span key={i} className="w-10 h-10 rounded-lg bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center font-bold text-lg uppercase text-emerald-800">
                    {l}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {scrambledLetters.map((l, i) => (
                  <button
                    key={`${i}-${l}`}
                    onClick={() => handleScrambleTap(l, i)}
                    disabled={isCorrect}
                    className="w-10 h-10 rounded-lg bg-sky-100 border-2 border-sky-300 font-bold text-lg uppercase text-sky-800 hover:bg-sky-200 transition-colors active:scale-90"
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* === SPELLING: SCRAMBLE === */}
          {q.type === 'spelling' && q.format === 'scramble' && (
            <div className="text-center">
              <p className="text-sm text-stone-500 mb-3">Unscramble the letters:</p>
              <div className="flex flex-wrap justify-center gap-2 mb-4 min-h-[44px]">
                {scrambleAnswer.map((l, i) => (
                  <span key={i} className="w-10 h-10 rounded-lg bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center font-bold text-lg uppercase text-emerald-800">
                    {l}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {scrambledLetters.map((l, i) => (
                  <button
                    key={`${i}-${l}`}
                    onClick={() => handleScrambleTap(l, i)}
                    disabled={isCorrect}
                    className="w-10 h-10 rounded-lg bg-amber-100 border-2 border-amber-300 font-bold text-lg uppercase text-amber-800 hover:bg-amber-200 transition-colors active:scale-90"
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* === SPELLING: MISSING === */}
          {q.type === 'spelling' && q.format === 'missing' && (
            <div className="text-center">
              <p className="text-sm text-stone-500 mb-3">Fill in the missing letters:</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {missingSlots.map((slot, i) => (
                  slot.isBlank ? (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={slot.filled}
                      onChange={e => handleMissingInput(i, e.target.value)}
                      disabled={isCorrect}
                      aria-label={`Letter ${i + 1}`}
                      className="w-10 h-10 rounded-lg border-2 border-accent text-center font-bold text-lg uppercase bg-accent-light/20 focus:border-primary focus:outline-none"
                    />
                  ) : (
                    <span key={i} className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-lg uppercase text-stone-600">
                      {slot.char}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}

          {/* === MATHS === */}
          {q.type === 'maths' && (
            <div className="text-center">
              <p className="text-2xl font-extrabold text-garden-text mb-6">
                {q.question} = ?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {mathChoices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleMathsChoice(choice, q)}
                    disabled={isCorrect}
                    className="py-3 px-4 rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-800 font-bold text-lg hover:bg-blue-100 transition-colors active:scale-95 disabled:opacity-60"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 text-center font-bold text-lg ${isCorrect ? 'text-emerald-600' : 'text-amber-600'}`}
              >
                {isCorrect && <Star weight="fill" size={20} className="inline mr-1" />}
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
