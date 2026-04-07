'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameCard from '@/components/ui/GameCard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  Shuffle,
  MagnifyingGlass,
  SpeakerHigh,
  PuzzlePiece,
  Cards,
  Plant,
  Flower,
  CloudArrowDown,
  Mountains,
  GridFour,
} from '@phosphor-icons/react';

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
  is_active?: number;
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
    title: 'Word Search',
    description: 'Find all the hidden words in the puzzle grid!',
    emoji: <PuzzlePiece weight="duotone" size={48} color="#FF9800" />,
    href: '/spelling/wordsearch',
    color: 'bg-fun-orange/10 border-2 border-fun-orange/30',
  },
  {
    title: 'Memory Match',
    description: 'Flip the cards and find matching word pairs!',
    emoji: <Cards weight="duotone" size={48} color="#9C27B0" />,
    href: '/spelling/memory',
    color: 'bg-fun-purple/10 border-2 border-fun-purple/30',
  },
  {
    title: 'Word Scramble',
    description: 'Unscramble the letters to spell the word!',
    emoji: <Shuffle weight="duotone" size={48} color="#4CAF50" />,
    href: '/spelling/scramble',
    color: 'bg-primary-light/10 border-2 border-primary-light/30',
  },
  {
    title: 'Missing Letters',
    description: 'Fill in the missing letters to complete each word!',
    emoji: <MagnifyingGlass weight="duotone" size={48} color="#FF9800" />,
    href: '/spelling/missing',
    color: 'bg-accent-light/10 border-2 border-accent-light/30',
  },
  {
    title: 'Word Builder',
    description: 'Listen to the word and build it letter by letter!',
    emoji: <SpeakerHigh weight="duotone" size={48} color="#FFD54F" />,
    href: '/spelling/builder',
    color: 'bg-secondary/10 border-2 border-secondary/30',
  },
  {
    title: 'Spell Catcher',
    description: 'Catch the falling letters to spell the word!',
    emoji: <CloudArrowDown weight="duotone" size={48} color="#42A5F5" />,
    href: '/spelling/catcher',
    color: 'bg-accent-light/10 border-2 border-accent-light/30',
  },
  {
    title: 'Word Volcano',
    description: 'Tap letter rocks before the lava rises!',
    emoji: <Mountains weight="duotone" size={48} color="#EF5350" />,
    href: '/spelling/volcano',
    color: 'bg-fun-orange/10 border-2 border-fun-orange/30',
  },
  {
    title: 'Wordal',
    description: 'Guess the hidden word in 6 tries!',
    emoji: <GridFour weight="duotone" size={48} color="#66BB6A" />,
    href: '/spelling/wordal',
    color: 'bg-primary-light/10 border-2 border-primary-light/30',
  },
];

export default function SpellingHub() {
  const [allLists, setAllLists] = useState<SpellingList[]>([]);
  const [list, setList] = useState<SpellingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [noList, setNoList] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/spellings')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.json();
      })
      .then((data: SpellingList[]) => {
        if (data.length > 0) {
          setAllLists(data);
          const active = data.find((l) => l.is_active) || data[0];
          if (active && active.words.length > 0) {
            setList(active);
          } else {
            setNoList(true);
          }
        } else {
          setNoList(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  function switchList(id: number) {
    const selected = allLists.find((l) => l.id === id);
    if (selected) setList(selected);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Breadcrumbs />
        <LoadingSpinner />
        <p className="text-garden-text-light font-semibold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Breadcrumbs />
        <div className="game-card p-10 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-extrabold text-garden-text mb-3">
            Oops! Could not load words
          </h2>
          <p className="text-garden-text-light text-lg">
            Something went wrong. Try going back and trying again!
          </p>
        </div>
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
        <Breadcrumbs />
        <div className="game-card p-10 text-center max-w-md mx-auto">
          <span className="text-6xl block mb-4"><Plant weight="duotone" size={64} color="#66BB6A" /></span>
          <h2 className="text-2xl font-extrabold text-garden-text mb-3">
            No spelling words yet!
          </h2>
          <p className="text-garden-text-light text-lg mb-6">
            Ask a grown-up to add some spelling words for you!
          </p>
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
        <Breadcrumbs />
      </motion.div>

      <motion.section variants={fadeUp} className="text-center">
        <h1 className="page-title">
          Spelling Practice
        </h1>
        {list && (
          <div className="mt-3 flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-primary-light/20 px-4 py-2 rounded-full">
              <Flower weight="duotone" size={20} color="#FFD54F" />
              <span className="font-bold text-garden-text">{list.name}</span>
              <span className="text-garden-text-light">
                · {list.words.length} words
              </span>
            </div>
            {allLists.length > 1 && (
              <select
                value={list.id}
                onChange={(e) => switchList(Number(e.target.value))}
                className="select-student"
              >
                {allLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.words.length} words){l.is_active ? ' — current' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </motion.section>

      <motion.section variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {games.map((game) => (
            <motion.div key={game.href} variants={fadeUp}>
              <GameCard {...game} href={list ? `${game.href}?listId=${list.id}` : game.href} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.p
        variants={fadeUp}
        className="text-center text-garden-text-light font-semibold text-lg pb-4"
      >
        Pick a game and have fun practising!
      </motion.p>
    </motion.div>
  );
}
