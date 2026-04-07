'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameCard from '@/components/ui/GameCard';
import { Plant, Tree, TreeEvergreen, Lightning, Books, Calculator, GameController } from '@phosphor-icons/react';
import { SvgDaisy, SvgTulip, SvgBluebell, SvgDaffodil, SvgLavender } from '@/components/svg';
import Link from 'next/link';

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

export default function Home() {
  const [name, setName] = useState('Learner');

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.name) setName(data.name); })
      .catch(() => {});
  }, []);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      {/* Welcome header */}
      <motion.section variants={fadeUp} className="text-center md:text-left">
        <h1 className="page-title text-left md:text-left">
          Welcome back, <span className="text-primary">{name}</span>!
        </h1>
        <p className="mt-2 text-lg text-garden-text-light">
          Your Magical Learning Garden is ready. What would you like to explore today?
        </p>
      </motion.section>

      {/* Main activity cards */}
      <motion.section variants={fadeUp}>
        <h2 className="text-xl font-bold text-garden-text mb-4">
          Choose your adventure
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <GameCard
            title="Spelling"
            description="Practice your weekly words and build your vocabulary garden!"
            emoji={<Books weight="duotone" size={48} color="#4CAF50" />}
            href="/spelling"
            color="bg-primary-light/10 border-2 border-primary-light/30"
          />
          <GameCard
            title="Maths"
            description="Master your times tables and earn golden stars!"
            emoji={<Calculator weight="duotone" size={48} color="#FF9800" />}
            href="/maths"
            color="bg-accent-light/10 border-2 border-accent-light/30"
          />
          <GameCard
            title="Games"
            description="Play fun games just for the joy of it!"
            emoji={<GameController weight="duotone" size={48} color="#9C27B0" />}
            href="/games"
            color="bg-fun-purple/10 border-2 border-fun-purple/30"
          />
          <GameCard
            title="Challenges"
            description="A quick mix of spelling and maths — practise what needs it most!"
            emoji={<Lightning weight="duotone" size={48} color="#F59E0B" />}
            href="/challenges"
            color="bg-amber-50 border-2 border-amber-200"
          />
        </div>
      </motion.section>

      {/* Garden progress — links to My Garden */}
      <Link href="/progress" className="block">
        <motion.section
          variants={fadeUp}
          className="game-card p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
        >
          <h2 className="text-xl font-bold text-garden-text mb-3">
            Your Garden
          </h2>
          <p className="text-garden-text-light mb-4">
            Keep learning to grow beautiful flowers and unlock achievements!
          </p>
          <div className="flex justify-center items-end gap-4 opacity-50 select-none">
            <SvgBluebell size={28} />
            <Tree weight="duotone" size={44} color="#4CAF50" />
            <SvgDaisy size={38} color="#E91E63" />
            <SvgDaffodil size={42} />
            <TreeEvergreen weight="duotone" size={48} color="#2E7D32" />
            <SvgTulip size={36} color="#AB47BC" />
            <SvgLavender size={34} />
          </div>
          <p className="mt-3 text-sm text-garden-text-light">
            Tap to see your garden grow!
          </p>
        </motion.section>
      </Link>

      {/* Encouraging footer */}
      <motion.p
        variants={fadeUp}
        className="text-center text-garden-text-light font-semibold text-lg pb-4"
      >
        You&apos;re doing brilliantly — every little bit counts!
      </motion.p>
    </motion.div>
  );
}
