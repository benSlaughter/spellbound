'use client';

import { motion } from 'framer-motion';

/** Props for the Badge component. */
export interface BadgeProps {
  /** Emoji icon displayed on the badge when unlocked */
  emoji: string;
  /** Display title shown below the badge */
  title: string;
  /** Whether the achievement has been earned (default: false) */
  unlocked?: boolean;
  /** Description of how to unlock the achievement */
  description?: string;
}

/**
 * A circular achievement badge that shows an emoji when unlocked
 * or a "?" when locked. Includes a spring animation on unlock.
 */
export default function Badge({ emoji, title, unlocked = false, description }: BadgeProps) {
  return (
    <motion.div
      initial={unlocked ? { scale: 0 } : false}
      animate={unlocked ? { scale: 1 } : undefined}
      transition={
        unlocked
          ? { type: 'spring', stiffness: 300, damping: 12 }
          : undefined
      }
      className={`
        flex flex-col items-center gap-2 select-none
      `}
    >
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center text-3xl
          ${
            unlocked
              ? 'bg-secondary shadow-lg ring-4 ring-secondary-light'
              : 'bg-gray-200 text-gray-400'
          }
        `}
        {...(!unlocked && { title: description || title })}
      >
        {unlocked ? emoji : '?'}
      </div>
      <span
        className={`text-xs font-bold text-center leading-tight ${
          unlocked ? 'text-garden-text' : 'text-gray-400'
        }`}
      >
        {title}
      </span>
    </motion.div>
  );
}
