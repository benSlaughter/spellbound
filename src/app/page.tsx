'use client';

import { motion } from 'framer-motion';
import GameCard from '@/components/ui/GameCard';
import { Plant, Tree, Flower, FlowerLotus, TreeEvergreen } from '@phosphor-icons/react';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const SUGGESTIONS = [
  'Why not try some spelling practice? 📝',
  'Ready for a maths challenge? 🔢',
  'Your garden is waiting to grow! 🌻',
  'Practice makes perfect — let\'s go! 🚀',
];

export default function Home() {
  const suggestion = SUGGESTIONS[new Date().getDay() % SUGGESTIONS.length];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      {/* Welcome header */}
      <motion.section variants={fadeUp} className="text-center md:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-garden-text">
          Welcome back, <span className="text-primary">Learner</span>!
        </h1>
        <p className="mt-2 text-lg text-garden-text-light">
          Your Magical Learning Garden is ready. What would you like to explore today?
        </p>
      </motion.section>

      {/* Today's suggestion */}
      <motion.div
        variants={fadeUp}
        className="game-card p-5 flex items-center gap-4 bg-secondary-light/30 border border-secondary/30"
      >
        <span className="text-3xl">💡</span>
        <div>
          <p className="font-bold text-garden-text">Today&apos;s idea</p>
          <p className="text-garden-text-light">{suggestion}</p>
        </div>
      </motion.div>

      {/* Main activity cards */}
      <motion.section variants={fadeUp}>
        <h2 className="text-xl font-bold text-garden-text mb-4">
          Choose your adventure
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <GameCard
            title="Spelling"
            description="Practice your weekly words and build your vocabulary garden!"
            emoji="📚"
            href="/spelling"
            color="bg-primary-light/10 border-2 border-primary-light/30"
          />
          <GameCard
            title="Maths"
            description="Master your times tables and earn golden stars!"
            emoji="🔢"
            href="/maths"
            color="bg-accent-light/10 border-2 border-accent-light/30"
          />
          <GameCard
            title="My Garden"
            description="See how much your learning garden has grown!"
            emoji="🌱"
            href="/progress"
            color="bg-secondary/10 border-2 border-secondary/30"
          />
          <GameCard
            title="Challenges"
            description="Coming soon — special missions to test your skills!"
            emoji="🏆"
            href="/challenges"
            color="bg-fun-orange/10 border-2 border-fun-orange/30"
            locked
          />
        </div>
      </motion.section>

      {/* Garden progress placeholder */}
      <motion.section
        variants={fadeUp}
        className="game-card p-6 text-center"
      >
        <h2 className="text-xl font-bold text-garden-text mb-3">
          Your Garden
        </h2>
        <p className="text-garden-text-light mb-4">
          Keep learning to grow beautiful flowers and unlock achievements!
        </p>
        <div className="flex justify-center items-end gap-4 opacity-50 select-none">
          <Plant weight="duotone" size={28} color="#66BB6A" />
          <Tree weight="duotone" size={44} color="#4CAF50" />
          <Flower weight="duotone" size={38} color="#E91E63" />
          <FlowerLotus weight="duotone" size={42} color="#FFD54F" />
          <TreeEvergreen weight="duotone" size={48} color="#2E7D32" />
        </div>
        <p className="mt-3 text-sm text-garden-text-light">
          Complete activities to watch your garden bloom!
        </p>
      </motion.section>

      {/* Encouraging footer */}
      <motion.p
        variants={fadeUp}
        className="text-center text-garden-text-light font-semibold text-lg pb-4"
      >
        You&apos;re doing brilliantly — every little bit counts! 🌈
      </motion.p>
    </motion.div>
  );
}
