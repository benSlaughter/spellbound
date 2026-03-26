'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import GameCard from '@/components/ui/GameCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { GAMES_UNLOCKS } from '@/lib/unlocks';
import { Cards, Sparkle, Trophy, type Icon } from '@phosphor-icons/react';

const ICON_MAP: Record<string, Icon> = {
  Cards,
  Sparkle,
};

const STORAGE_KEY = 'spellbound-unlocked-count';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function GamesHub() {
  const [totalAnswers, setTotalAnswers] = useState<number | null>(null);
  const [unlockedGames, setUnlockedGames] = useState<string[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState(false);

  useEffect(() => {
    fetch('/api/unlocks')
      .then((r) => r.json())
      .then((data: { totalAnswers: number; unlockedGames: string[] }) => {
        setTotalAnswers(data.totalAnswers);
        setUnlockedGames(data.unlockedGames);

        // Check if new games were unlocked since last visit
        try {
          const prev = parseInt(
            localStorage.getItem(STORAGE_KEY) ?? '0',
            10
          );
          if (data.unlockedGames.length > prev) {
            setNewlyUnlocked(true);
            setTimeout(() => setNewlyUnlocked(false), 4000);
          }
          localStorage.setItem(
            STORAGE_KEY,
            String(data.unlockedGames.length)
          );
        } catch {
          // localStorage unavailable
        }
      })
      .catch(() => {
        setTotalAnswers(0);
        setUnlockedGames([]);
      });
  }, []);

  if (totalAnswers === null) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 pb-12"
    >
      <motion.div variants={fadeUp}>
        <Breadcrumbs />
      </motion.div>

      <motion.section variants={fadeUp} className="text-center">
        <h1 className="page-title">Games</h1>
        <p className="page-subtitle">Just for fun — play and enjoy!</p>
      </motion.section>

      {/* Unlock celebration notification */}
      <AnimatePresence>
        {newlyUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="game-card p-5 text-center bg-secondary/20 border-2 border-secondary/40"
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy weight="duotone" size={32} color="#FFD54F" />
              <p className="text-lg font-bold text-garden-text">
                🎉 New game unlocked!
              </p>
              <Trophy weight="duotone" size={32} color="#FFD54F" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress summary */}
      <motion.div variants={fadeUp} className="game-card p-5 text-center">
        <p className="text-lg font-bold text-garden-text">
          You have {totalAnswers} correct answer{totalAnswers !== 1 ? 's' : ''}!
        </p>
        <p className="text-garden-text-light text-sm">
          Keep playing spelling and maths games to unlock more fun!
        </p>
      </motion.div>

      <motion.section variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GAMES_UNLOCKS.map((game) => {
            const isUnlocked = unlockedGames.includes(game.href);
            const IconComponent = ICON_MAP[game.iconName];

            return (
              <motion.div key={game.href} variants={fadeUp}>
                <GameCard
                  title={game.title}
                  description={
                    isUnlocked
                      ? game.description
                      : `${game.unlockMessage} (${totalAnswers}/${game.requiredCorrect})`
                  }
                  emoji={
                    IconComponent ? (
                      <IconComponent
                        weight="duotone"
                        size={48}
                        color={isUnlocked ? game.iconColor : '#9E9E9E'}
                      />
                    ) : (
                      <Sparkle
                        weight="duotone"
                        size={48}
                        color={isUnlocked ? game.iconColor : '#9E9E9E'}
                      />
                    )
                  }
                  href={game.href}
                  color={game.cardColor}
                  locked={!isUnlocked}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <motion.p
        variants={fadeUp}
        className="text-center text-garden-text-light font-semibold text-lg pb-4"
      >
        More games coming soon — check back later!
      </motion.p>
    </motion.div>
  );
}
