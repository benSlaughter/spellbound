'use client';

import { motion } from 'framer-motion';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import GameCard from '@/components/ui/GameCard';
import { Lightning, Target, CalendarCheck } from '@phosphor-icons/react';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ChallengesPage() {
  return (
    <div className="page-container">
      <Breadcrumbs />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="page-title">Challenges</h1>
          <p className="page-subtitle">
            Quick practice rounds that focus on what you need most!
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <GameCard
            title="Daily Challenge"
            description="A quick mix of your weakest spelling words and maths facts — 6 questions, just for you!"
            emoji={<Lightning weight="duotone" size={48} color="#F59E0B" />}
            href="/challenges/daily"
            color="bg-amber-50 border-2 border-amber-200"
          />
          <GameCard
            title="Spelling Focus"
            description="Coming soon — practise just your trickiest spelling words!"
            emoji={<Target weight="duotone" size={48} color="#10B981" />}
            href="/challenges"
            color="bg-emerald-50 border-2 border-emerald-200"
            locked
          />
          <GameCard
            title="Weekly Review"
            description="Coming soon — a look back at everything you've practised this week!"
            emoji={<CalendarCheck weight="duotone" size={48} color="#6366F1" />}
            href="/challenges"
            color="bg-indigo-50 border-2 border-indigo-200"
            locked
          />
        </motion.div>

        <motion.p variants={fadeUp} className="msg-encouragement text-center">
          More challenges coming soon — keep practising!
        </motion.p>
      </motion.div>
    </div>
  );
}
