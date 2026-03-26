'use client';

import { motion } from 'framer-motion';

const dots = [
  { color: 'bg-primary', delay: 0 },
  { color: 'bg-secondary', delay: 0.15 },
  { color: 'bg-accent', delay: 0.3 },
  { color: 'bg-fun-orange', delay: 0.45 },
];

/**
 * An accessible loading indicator with four bouncing coloured dots.
 * Uses staggered Framer Motion animations.
 */
export default function LoadingSpinner() {
  return (
    <div
      className="flex items-center justify-center gap-2 py-8"
      role="status"
      aria-label="Loading"
    >
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className={`w-4 h-4 rounded-full ${dot.color}`}
          animate={{ y: [0, -14, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: dot.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
