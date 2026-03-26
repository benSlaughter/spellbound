'use client';

import { type ReactNode } from 'react';
import { useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Sparkle,
  Flower,
  Butterfly,
  Heart,
  Rainbow,
  Trophy,
} from '@phosphor-icons/react';

const MESSAGES = [
  'Amazing!',
  'Fantastic!',
  'You did it!',
  'Brilliant!',
  'Keep Going!',
  'Super Star!',
  'Well Done!',
];

const PARTICLE_ICONS: ReactNode[] = [
  <Star key="star" weight="duotone" size={20} color="#FFD54F" />,
  <Sparkle key="sparkle" weight="duotone" size={20} color="#FFD54F" />,
  <Flower key="flower" weight="duotone" size={20} color="#E91E63" />,
  <Butterfly key="butterfly" weight="duotone" size={20} color="#9C27B0" />,
  <Heart key="heart" weight="duotone" size={20} color="#EF5350" />,
  <Rainbow key="rainbow" weight="duotone" size={20} color="#E91E63" />,
  <Star key="star2" weight="fill" size={20} color="#FFC107" />,
  <Sparkle key="sparkle2" weight="fill" size={20} color="#FF9800" />,
];

interface ConfettiPiece {
  id: number;
  icon: ReactNode;
  x: number;
  delay: number;
  duration: number;
}

function makeConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    icon: PARTICLE_ICONS[i % PARTICLE_ICONS.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.5 + Math.random() * 1.5,
  }));
}

/** Props for the CelebrationOverlay component. */
export interface CelebrationOverlayProps {
  /** Whether to show the overlay */
  show: boolean;
  /** Large icon displayed in the centre (default: Trophy) */
  emoji?: ReactNode;
  /** Congratulatory message text */
  message?: string;
  /** Callback when the overlay is dismissed (click or auto-close) */
  onDismiss: () => void;
  /** Time in milliseconds before auto-dismissing (default: 3000) */
  autoCloseMs?: number;
  /** If true, navigate back after dismissal (default: false) */
  navigateBack?: boolean;
}

/**
 * A full-screen celebration overlay with confetti particles and a centre message.
 * Auto-dismisses after a configurable delay. Click anywhere to dismiss early.
 */
export default function CelebrationOverlay({
  show,
  emoji = <Trophy weight="duotone" size={72} color="#FFD54F" />,
  message,
  onDismiss,
  autoCloseMs = 3000,
  navigateBack = false,
}: CelebrationOverlayProps) {
  const confetti = useMemo(() => makeConfetti(24), []);
  const displayMessage = message ?? MESSAGES[0];
  const router = useRouter();

  const stableDismiss = useCallback(() => {
    onDismiss();
    if (navigateBack) {
      router.back();
    }
  }, [onDismiss, navigateBack, router]);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(stableDismiss, autoCloseMs);
    return () => clearTimeout(timer);
  }, [show, autoCloseMs, stableDismiss]);

  useEffect(() => {
    if (!show) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') stableDismiss(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [show, stableDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          onClick={stableDismiss}
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
              className="fixed top-0 pointer-events-none select-none"
              style={{ left: `${piece.x}%` }}
            >
              {piece.icon}
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
            <span className="flex items-center justify-center">{emoji}</span>
            <p className="text-2xl font-extrabold text-garden-text">
              {displayMessage}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
