'use client';

import { motion } from 'framer-motion';

export interface BadgeProps {
  emoji: string;
  title: string;
  unlocked?: boolean;
}

export default function Badge({ emoji, title, unlocked = false }: BadgeProps) {
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
