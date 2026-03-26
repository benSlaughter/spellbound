'use client';

import { motion } from 'framer-motion';

/** Props for the ProgressStars component. */
export interface ProgressStarsProps {
  /** Number of stars to show as filled/active */
  filled: number;
  /** Total number of stars to display (default: 5) */
  total?: number;
  /** Star size: 'sm', 'md', or 'lg' (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

/**
 * A row of animated stars indicating progress or completion.
 * Filled stars appear in colour; unfilled stars are dimmed.
 * Each star animates in with a staggered spring effect.
 */
export default function ProgressStars({
  filled,
  total = 5,
  size = 'md',
}: ProgressStarsProps) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${filled} of ${total} stars`}>
      {Array.from({ length: total }, (_, i) => {
        const isFilled = i < filled;
        return (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 15,
              delay: i * 0.1,
            }}
            className={`${sizes[size]} select-none ${isFilled ? '' : 'opacity-30 grayscale'}`}
          >
            ⭐
          </motion.span>
        );
      })}
    </div>
  );
}
