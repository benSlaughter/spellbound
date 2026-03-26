'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Amazing! 🎉',
  'Fantastic! 🌟',
  'You did it! 🏆',
  'Brilliant! ✨',
  'Keep Going! 🚀',
  'Super Star! ⭐',
  'Well Done! 🎊',
];

const PARTICLE_EMOJIS = ['🎉', '⭐', '🌟', '✨', '🎊', '🌸', '🦋', '🌈'];

interface ConfettiPiece {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
}

function makeConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: PARTICLE_EMOJIS[i % PARTICLE_EMOJIS.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.5 + Math.random() * 1.5,
  }));
}

/** Props for the CelebrationOverlay component. */
export interface CelebrationOverlayProps {
  /** Whether to show the overlay */
  show: boolean;
  /** Large emoji displayed in the centre (default: '🏆') */
  emoji?: string;
  /** Congratulatory message text */
  message?: string;
  /** Callback when the overlay is dismissed (click or auto-close) */
  onDismiss: () => void;
  /** Time in milliseconds before auto-dismissing (default: 3000) */
  autoCloseMs?: number;
}

/**
 * A full-screen celebration overlay with confetti particles and a centre message.
 * Auto-dismisses after a configurable delay. Click anywhere to dismiss early.
 */
export default function CelebrationOverlay({
  show,
  emoji = '🏆',
  message,
  onDismiss,
  autoCloseMs = 3000,
}: CelebrationOverlayProps) {
  const confetti = useMemo(() => makeConfetti(24), []);
  const displayMessage = message ?? MESSAGES[0];

  const stableDismiss = useCallback(() => onDismiss(), [onDismiss]);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(stableDismiss, autoCloseMs);
    return () => clearTimeout(timer);
  }, [show, autoCloseMs, stableDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          onClick={onDismiss}
        >
          {/* Confetti particles */}
          {confetti.map((piece) => (
            <motion.span
              key={piece.id}
              initial={{ y: -60, x: `${piece.x}vw`, opacity: 1, scale: 0 }}
              animate={{
                y: '100vh',
                opacity: [1, 1, 0],
                scale: [0, 1.2, 0.8],
                rotate: [0, 360],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeOut',
              }}
              className="fixed top-0 text-2xl pointer-events-none select-none"
              style={{ left: `${piece.x}%` }}
            >
              {piece.emoji}
            </motion.span>
          ))}

          {/* Centre message */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="flex flex-col items-center gap-4 bg-white rounded-3xl p-10 shadow-2xl"
          >
            <span className="text-7xl">{emoji}</span>
            <p className="text-2xl font-extrabold text-garden-text">
              {displayMessage}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
