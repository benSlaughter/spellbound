'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
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
}

function renderIcon(emoji: ReactNode): ReactNode {
  if (typeof emoji === 'string' && ICON_MAP[emoji]) {
    const Icon = ICON_MAP[emoji];
    return <Icon size={32} weight="duotone" />;
  }
  return emoji;
}

/**
 * A circular achievement badge that shows an icon when unlocked
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
          w-16 h-16 rounded-full flex items-center justify-center
          ${
            unlocked
              ? 'bg-secondary shadow-lg ring-4 ring-secondary-light'
              : 'bg-gray-200 text-gray-400'
          }
        `}
        {...(!unlocked && { title: description || title })}
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
    </motion.div>
  );
}
