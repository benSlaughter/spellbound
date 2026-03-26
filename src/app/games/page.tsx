'use client';

import { motion } from 'framer-motion';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import GameCard from '@/components/ui/GameCard';
import { GameController, PuzzlePiece, Sparkle } from '@phosphor-icons/react';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function GamesHub() {
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

      <motion.section variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <motion.div variants={fadeUp}>
            <GameCard
              title="Coming Soon"
              description="Fun new games are on the way — stay tuned!"
              emoji={<Sparkle weight="duotone" size={48} color="#FFD54F" />}
              href="/games"
              color="bg-secondary/10 border-2 border-secondary/30"
              locked
            />
          </motion.div>
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
