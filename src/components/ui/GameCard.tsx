'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/** Props for the GameCard component. */
export interface GameCardProps {
  /** The game title displayed on the card */
  title: string;
  /** Short description of the game */
  description: string;
  /** Emoji icon for the game */
  emoji: string;
  /** URL to navigate to when clicked */
  href: string;
  /** Tailwind background colour class (e.g. 'bg-primary-light') */
  color: string;
  /** Whether the game is locked/unavailable (default: false) */
  locked?: boolean;
}

/**
 * A colourful card for game selection grids.
 * Includes hover/tap animations and optional locked state.
 * Locked cards display a lock icon and are not clickable.
 */
export default function GameCard({
  title,
  description,
  emoji,
  href,
  color,
  locked = false,
}: GameCardProps) {
  const card = (
    <motion.div
      whileHover={locked ? undefined : { scale: 1.04, y: -4 }}
      whileTap={locked ? undefined : { scale: 0.98 }}
      className={`
        relative game-card p-6 flex flex-col items-center text-center gap-3
        cursor-pointer select-none overflow-hidden
        ${locked ? 'opacity-60 grayscale' : ''}
        ${color}
      `}
    >
      <span className="text-5xl" role="img" aria-hidden="true">
        {locked ? '🔒' : emoji}
      </span>

      <h3 className="text-xl font-extrabold text-garden-text">{title}</h3>

      <p className="text-sm text-garden-text-light leading-snug">
        {description}
      </p>

      {locked && (
        <div className="absolute inset-0 bg-white/40 flex items-center justify-center rounded-2xl">
          <span className="text-4xl">🔒</span>
        </div>
      )}
    </motion.div>
  );

  if (locked) return card;

  return (
    <Link href={href} className="block">
      {card}
    </Link>
  );
}
