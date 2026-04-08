'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowCounterClockwise, House } from '@phosphor-icons/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';

const COLORS = [
  { name: 'red', bg: 'bg-red-400', active: 'bg-red-500 ring-4 ring-red-300 scale-105', freq: 261.63 },
  { name: 'green', bg: 'bg-emerald-400', active: 'bg-emerald-500 ring-4 ring-emerald-300 scale-105', freq: 329.63 },
  { name: 'blue', bg: 'bg-blue-400', active: 'bg-blue-500 ring-4 ring-blue-300 scale-105', freq: 392.00 },
  { name: 'yellow', bg: 'bg-amber-400', active: 'bg-amber-500 ring-4 ring-amber-300 scale-105', freq: 523.25 },
];

type GameState = 'idle' | 'showing' | 'input' | 'success' | 'gameover';

function playTone(freq: number, duration: number = 200) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.3;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch {
    // Audio not available
  }
}

const ENCOURAGEMENTS = [
  'Amazing memory!', 'You remembered it all!', 'Brilliant!',
  'Super brain!', 'Well done!', 'Incredible!',
];

export default function SimonPage() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeBtn, setActiveBtn] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [bestScore, setBestScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const showingRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('simon-best');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setBestScore(parseInt(saved, 10));
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const flashButton = useCallback((idx: number, duration: number = 400) => {
    return new Promise<void>(resolve => {
      setActiveBtn(idx);
      playTone(COLORS[idx].freq, duration);
      setTimeout(() => {
        setActiveBtn(null);
        setTimeout(resolve, 150);
      }, duration);
    });
  }, []);

  const showSequence = useCallback(async (seq: number[]) => {
    showingRef.current = true;
    setGameState('showing');
    setFeedback(null);

    // Brief pause before showing
    await new Promise(r => setTimeout(r, 600));

    const speed = Math.max(250, 500 - seq.length * 20);
    for (const idx of seq) {
      if (!showingRef.current) return;
      await flashButton(idx, speed);
    }

    showingRef.current = false;
    setGameState('input');
    setPlayerInput([]);
  }, [flashButton]);

  const startGame = useCallback(() => {
    const first = Math.floor(Math.random() * 4);
    const newSeq = [first];
    setSequence(newSeq);
    setPlayerInput([]);
    setFeedback(null);
    showSequence(newSeq);
  }, [showSequence]);

  const addToSequence = useCallback((currentSeq: number[]) => {
    const next = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, next];
    setSequence(newSeq);
    setFeedback(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);

    timerRef.current = setTimeout(() => {
      showSequence(newSeq);
    }, 1200);
  }, [showSequence]);

  const handlePress = useCallback((idx: number) => {
    if (gameState !== 'input') return;

    // Flash the pressed button
    setActiveBtn(idx);
    playTone(COLORS[idx].freq, 200);
    setTimeout(() => setActiveBtn(null), 200);

    const newInput = [...playerInput, idx];
    setPlayerInput(newInput);

    const step = newInput.length - 1;

    if (newInput[step] !== sequence[step]) {
      // Wrong!
      setGameState('gameover');
      setFeedback(null);
      playSound('pop');
      const score = sequence.length - 1;
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem('simon-best', String(score));
      }
      return;
    }

    if (newInput.length === sequence.length) {
      // Completed the sequence!
      setGameState('success');
      addToSequence(sequence);
    }
  }, [gameState, playerInput, sequence, bestScore, addToSequence]);

  const roundNumber = sequence.length;

  return (
    <div className="page-container max-w-md mx-auto">
      <Breadcrumbs />

      <div className="text-center mb-6">
        <h1 className="page-title flex items-center justify-center gap-2">
          <Brain weight="duotone" size={28} className="text-pink-500" />
          Simon Says
        </h1>
        <p className="text-garden-text-light">
          {gameState === 'idle' && 'Watch the pattern, then repeat it!'}
          {gameState === 'showing' && 'Watch carefully...'}
          {gameState === 'input' && 'Your turn! Repeat the pattern.'}
          {gameState === 'success' && `Round ${roundNumber} complete!`}
          {gameState === 'gameover' && `You remembered ${roundNumber - 1} rounds!`}
        </p>
      </div>

      {/* Game board — 2×2 grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-[280px] mx-auto">
        {COLORS.map((color, idx) => (
          <motion.button
            key={color.name}
            onClick={() => handlePress(idx)}
            disabled={gameState !== 'input'}
            whileTap={gameState === 'input' ? { scale: 0.92 } : undefined}
            className={`
              aspect-square rounded-2xl transition-all duration-150 border-2 border-white/20
              ${activeBtn === idx ? color.active : color.bg}
              ${gameState === 'input' ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
              ${gameState !== 'input' && activeBtn !== idx ? 'opacity-70' : 'opacity-100'}
            `}
            aria-label={`${color.name} button`}
          />
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center font-bold text-lg text-emerald-600 mb-4"
        >
          {feedback}
        </motion.p>
      )}

      {/* Start / Game Over */}
      <div className="text-center">
        {gameState === 'idle' && (
          <button
            onClick={startGame}
            className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full text-lg transition-colors"
          >
            Start!
          </button>
        )}

        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="question-card p-6 text-center">
              <p className="text-xl font-extrabold text-garden-text mb-1">
                {roundNumber - 1 === 0 ? "Don't worry — try again!" : `You got to round ${roundNumber - 1}!`}
              </p>
              {bestScore > 0 && (
                <p className="text-sm text-garden-text-light">
                  Your best: {bestScore} round{bestScore !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full transition-colors"
              >
                <ArrowCounterClockwise weight="bold" size={20} />
                Play Again
              </button>
              <Link
                href="/games"
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-full transition-colors"
              >
                <House weight="duotone" size={20} />
                Games
              </Link>
            </div>
          </motion.div>
        )}

        {gameState === 'input' && (
          <p className="text-sm text-stone-400">
            Step {playerInput.length + 1} of {sequence.length}
          </p>
        )}
      </div>
    </div>
  );
}
