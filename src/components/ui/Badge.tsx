'use client';

import { type ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Question,
  Plant,
  MagicWand,
  Sparkle,
  Calculator,
  Star,
  Butterfly,
  Rainbow,
  Trophy,
  MusicNotes,
  Medal,
  CheckCircle,
  Lock,
  type IconProps,
} from '@phosphor-icons/react';
import { type ComponentType } from 'react';

const ICON_MAP: Record<string, ComponentType<IconProps>> = {
  Plant,
  MagicWand,
  Sparkle,
  Calculator,
  Star,
  Butterfly,
  Rainbow,
  Trophy,
  MusicNotes,
  Medal,
};

/** Props for the Badge component. */
export interface BadgeProps {
  /** Phosphor icon name string or ReactNode displayed on the badge when unlocked */
  emoji: ReactNode;
  /** Display title shown below the badge */
  title: string;
  /** Whether the achievement has been earned (default: false) */
  unlocked?: boolean;
  /** Description of how to unlock the achievement */
  description?: string;
  /** Date the badge was unlocked */
  unlockedAt?: string;
  /** Progress towards unlocking: { current, target, label } */
  progress?: { current: number; target: number; label: string };
}

function renderIcon(emoji: ReactNode, size = 32): ReactNode {
  if (typeof emoji === 'string' && ICON_MAP[emoji]) {
    const Icon = ICON_MAP[emoji];
    return <Icon size={size} weight="duotone" />;
  }
  return emoji;
}

/**
 * A circular achievement badge that shows an icon when unlocked
 * or a "?" when locked. Click to see details.
 */
export default function Badge({ emoji, title, unlocked = false, description, unlockedAt, progress }: BadgeProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <motion.button
        initial={unlocked ? { scale: 0 } : false}
        animate={unlocked ? { scale: 1 } : undefined}
        transition={
          unlocked
            ? { type: 'spring', stiffness: 300, damping: 12 }
            : undefined
        }
        className="flex flex-col items-center gap-2 select-none cursor-pointer"
        onClick={() => setShowDetail(true)}
      >
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${
              unlocked
                ? 'bg-secondary shadow-lg ring-4 ring-secondary-light'
                : 'bg-gray-200 text-gray-400'
            }
          `}
        >
          {unlocked ? renderIcon(emoji) : <Question weight="duotone" size={32} />}
        </div>
        <span
          className={`text-xs font-bold text-center leading-tight ${
            unlocked ? 'text-garden-text' : 'text-gray-400'
          }`}
        >
          {title}
        </span>
      </motion.button>

      {/* Detail modal */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`
                w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4
                ${unlocked
                  ? 'bg-secondary shadow-lg ring-4 ring-secondary-light'
                  : 'bg-gray-200 text-gray-400'
                }
              `}>
                {unlocked ? renderIcon(emoji, 40) : <Lock weight="duotone" size={40} />}
              </div>

              <h3 className="text-lg font-extrabold text-garden-text mb-2">{title}</h3>

              {description && (
                <p className="text-garden-text-light text-sm mb-3">{description}</p>
              )}

              {progress && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs font-bold text-garden-text-light mb-1">
                    <span>{progress.current} / {progress.target} {progress.label}</span>
                    <span>{Math.round((progress.current / progress.target) * 100)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              {unlocked ? (
                <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                  <CheckCircle weight="duotone" size={20} />
                  <span>Unlocked{unlockedAt ? ` on ${new Date(unlockedAt).toLocaleDateString()}` : ''}!</span>
                </div>
              ) : (
                <p className="text-gray-400 text-sm font-semibold">Keep playing to unlock this badge!</p>
              )}

              <button
                onClick={() => setShowDetail(false)}
                className="mt-4 text-sm font-bold text-garden-text-light cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
