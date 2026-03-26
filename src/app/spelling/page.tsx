'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameCard from '@/components/ui/GameCard';
import BackButton from '@/components/ui/BackButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

interface SpellingWord {
  id: number;
  list_id: number;
  word: string;
  hint: string | null;
}

interface SpellingList {
  id: number;
  name: string;
  words: SpellingWord[];
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const games = [
  {
    title: 'Word Scramble',
    description: 'Unscramble the letters to spell the word!',
    emoji: '🔀',
    href: '/spelling/scramble',
    color: 'bg-primary-light/10 border-2 border-primary-light/30',
  },
  {
    title: 'Missing Letters',
    description: 'Fill in the missing letters to complete each word!',
    emoji: '🔍',
    href: '/spelling/missing',
    color: 'bg-accent-light/10 border-2 border-accent-light/30',
  },
  {
    title: 'Word Builder',
    description: 'Listen to the word and build it letter by letter!',
    emoji: '🔊',
    href: '/spelling/builder',
    color: 'bg-secondary/10 border-2 border-secondary/30',
  },
  {
    title: 'Word Search',
    description: 'Find all the hidden words in the puzzle grid!',
    emoji: '🧩',
    href: '/spelling/wordsearch',
    color: 'bg-fun-orange/10 border-2 border-fun-orange/30',
  },
  {
    title: 'Memory Match',
    description: 'Flip the cards and find matching word pairs!',
    emoji: '🃏',
    href: '/spelling/memory',
    color: 'bg-fun-purple/10 border-2 border-fun-purple/30',
  },
];

export default function SpellingHub() {
  const [list, setList] = useState<SpellingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [noList, setNoList] = useState(false);

  useEffect(() => {
    fetch('/api/spellings?active=true')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.json();
      })
      .then((data: SpellingList[]) => {
        if (data.length > 0 && data[0].words.length > 0) {
          setList(data[0]);
        } else {
          setNoList(true);
        }
      })
      .catch(() => setNoList(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
        <p className="mt-4 text-garden-text-light font-semibold">
          Loading your spelling words...
        </p>
      </div>
    );
  }

  if (noList) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
      >
        <BackButton />
        <div className="game-card p-10 text-center max-w-md">
          <span className="text-6xl block mb-4">🌱</span>
          <h2 className="text-2xl font-extrabold text-garden-text mb-3">
            No spelling words yet!
          </h2>
          <p className="text-garden-text-light text-lg mb-6">
            Ask a grown-up to add some, or add them yourself! 📝
          </p>
          <Link
            href="/entry"
            className="btn-primary text-lg px-8 py-3 no-underline"
          >
            ✏️ Add My Words
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <BackButton />
      </motion.div>

      <motion.section variants={fadeUp} className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-garden-text">
          📚 Spelling Practice
        </h1>
        {list && (
          <div className="mt-3 inline-flex items-center gap-2 bg-primary-light/20 px-4 py-2 rounded-full">
            <span className="text-lg">🌻</span>
            <span className="font-bold text-garden-text">{list.name}</span>
            <span className="text-garden-text-light">
              · {list.words.length} words
            </span>
          </div>
        )}
      </motion.section>

      <motion.section variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {games.map((game) => (
            <motion.div key={game.href} variants={fadeUp}>
              <GameCard {...game} />
            </motion.div>
          ))}
          <motion.div variants={fadeUp}>
            <GameCard
              title="Add This Week's Words"
              description="Type in your new spelling words for the week!"
              emoji="✏️"
              href="/entry"
              color="bg-secondary-light/10 border-2 border-secondary-light/30 border-dashed"
            />
          </motion.div>
        </div>
      </motion.section>

      <motion.p
        variants={fadeUp}
        className="text-center text-garden-text-light font-semibold text-lg pb-4"
      >
        Pick a game and have fun practising! 🌈
      </motion.p>
    </motion.div>
  );
}
