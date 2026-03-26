'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import GameCard from '@/components/ui/GameCard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import type { Difficulty } from '@/lib/maths-helpers';
import {
  Plant,
  Leaf,
  Tree,
  TreeEvergreen,
  MagnifyingGlass,
  Drop,
  Mountains,
  PuzzlePiece,
  FishSimple,
} from '@phosphor-icons/react';

const ALL_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const DIFF_KEY = 'spellbound-maths-difficulty';

const DIFFICULTIES: { key: Difficulty; label: string; icon: ReactNode; desc: string }[] = [
  { key: 'seedling', label: 'Seedling', icon: <Plant weight="duotone" size={24} color="#66BB6A" />, desc: 'Multiplication 1-6' },
  { key: 'sapling', label: 'Sapling', icon: <Leaf weight="duotone" size={24} color="#43A047" />, desc: 'Multiplication 1-12' },
  { key: 'tree', label: 'Tree', icon: <Tree weight="duotone" size={24} color="#4CAF50" />, desc: 'Multiply & divide mixed' },
  { key: 'mighty_oak', label: 'Mighty Oak', icon: <TreeEvergreen weight="duotone" size={24} color="#2E7D32" />, desc: 'Division focus' },
];

const GAMES = [
  {
    title: 'Times Table Explorer',
    description: 'Explore the whole multiplication grid — tap to discover patterns!',
    emoji: <MagnifyingGlass weight="duotone" size={48} color="#4CAF50" />,
    path: 'explorer',
    color: 'bg-primary-light/30',
  },
  {
    title: 'Number Bubbles',
    description: 'Pop the bubble with the right answer — splish splash!',
    emoji: <Drop weight="duotone" size={48} color="#2196F3" />,
    path: 'bubbles',
    color: 'bg-accent-light/30',
  },
  {
    title: 'Math Mountain',
    description: 'Climb to the snowy peak by answering questions along the way!',
    emoji: <Mountains weight="duotone" size={48} color="#8D6E63" />,
    path: 'mountain',
    color: 'bg-secondary-light/30',
  },
  {
    title: 'Puzzle Pieces',
    description: 'Solve maths puzzles to reveal a hidden picture!',
    emoji: <PuzzlePiece weight="duotone" size={48} color="#9C27B0" />,
    path: 'puzzle',
    color: 'bg-fun-purple/20',
  },
  {
    title: 'Number River',
    description: 'Hop across lily pads to cross the river — pick the right one!',
    emoji: <FishSimple weight="duotone" size={48} color="#4CAF50" />,
    path: 'river',
    color: 'bg-primary/20',
  },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function MathsHub() {
  const [selectedTables, setSelectedTables] = useState<number[]>(ALL_TABLES);
  const [enabledDifficulties, setEnabledDifficulties] = useState<string[]>(['seedling', 'sapling', 'tree', 'mighty_oak']);
  const [tablesLoaded, setTablesLoaded] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('sapling');

  // Restore saved difficulty from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DIFF_KEY);
      if (saved && ['seedling', 'sapling', 'tree', 'mighty_oak'].includes(saved)) {
        setDifficulty(saved as Difficulty);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetch('/api/maths/tables')
      .then((res) => res.json())
      .then((data: { tables: number[]; difficulties: string[] }) => {
        if (Array.isArray(data.tables) && data.tables.length > 0) {
          setSelectedTables(data.tables);
        }
        if (Array.isArray(data.difficulties) && data.difficulties.length > 0) {
          setEnabledDifficulties(data.difficulties);
        }
      })
      .catch(() => {})
      .finally(() => setTablesLoaded(true));
  }, []);

  // Sync difficulty to localStorage and auto-correct if not enabled
  useEffect(() => {
    if (tablesLoaded && !enabledDifficulties.includes(difficulty)) {
      setDifficulty(enabledDifficulties[0] as Difficulty);
    }
    localStorage.setItem(DIFF_KEY, difficulty);
  }, [difficulty, tablesLoaded, enabledDifficulties]);

  const tablesParam = [...selectedTables].sort((a, b) => a - b).join(',');
  const queryString = `?tables=${tablesParam}&difficulty=${difficulty}`;

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

      {/* Header */}
      <motion.section variants={fadeUp} className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-garden-text">
          Maths Garden
        </h1>
        <p className="mt-2 text-garden-text-light text-lg">
          Choose a game and have fun!
        </p>
      </motion.section>

      {/* Difficulty */}
      <motion.section variants={fadeUp} className="bg-garden-card rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-garden-text mb-4">Difficulty Level</h2>
        <div className={`grid gap-3 ${
          enabledDifficulties.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
          enabledDifficulties.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
          'grid-cols-2 sm:grid-cols-4'
        }`}>
          {DIFFICULTIES.filter((d) => enabledDifficulties.includes(d.key)).map((d) => {
            const active = difficulty === d.key;
            return (
              <motion.button
                key={d.key}
                whileTap={{ scale: 0.93 }}
                onClick={() => setDifficulty(d.key)}
                className={`
                  flex flex-col items-center gap-1 p-4 rounded-xl cursor-pointer
                  transition-all duration-200 min-h-[52px]
                  ${
                    active
                      ? 'bg-secondary text-garden-text shadow-md ring-2 ring-secondary-dark/40'
                      : 'bg-white text-garden-text-light border-2 border-garden-border hover:border-secondary-light'
                  }
                `}
              >
                <span className="flex items-center justify-center">{d.icon}</span>
                <span className="font-bold text-sm">{d.label}</span>
                <span className="text-xs opacity-70">{d.desc}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* Pick a Game */}
      <motion.section variants={fadeUp}>
        <h2 className="text-xl font-bold text-garden-text mb-4">Pick a Game</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map((game, i) => (
            <motion.div key={game.path} variants={fadeUp} custom={i}>
              <GameCard
                title={game.title}
                description={game.description}
                emoji={game.emoji}
                href={`/maths/${game.path}${queryString}`}
                color={game.color}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
