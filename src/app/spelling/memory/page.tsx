'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import { SvgTulip } from '@/components/svg';
import { playSound } from '@/lib/sounds';
import Link from 'next/link';
import {
  Plant,
  PencilSimple,
  Sparkle,
  Flower,
  FlowerLotus,
  Butterfly,
  Clover,
  Leaf,
  TreeEvergreen,
  Tree,
  Heart,
  Star,
  Cards,
} from '@phosphor-icons/react';
import { type ReactNode } from 'react';

interface SpellingWord {
  id: number;
  word: string;
  hint: string | null;
}

interface SpellingList {
  id: number;
  name: string;
  words: SpellingWord[];
}

interface Card {
  id: number;
  word: string;
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const CARD_BACKS: ReactNode[] = [
  <Flower key="f1" weight="duotone" size={32} color="#E91E63" />,
  <SvgTulip key="ft" size={32} color="#AB47BC" />,
  <FlowerLotus key="fl" weight="duotone" size={32} color="#FFD54F" />,
  <Butterfly key="b" weight="duotone" size={32} color="#9C27B0" />,
  <Clover key="c" weight="duotone" size={32} color="#66BB6A" />,
  <Leaf key="l" weight="duotone" size={32} color="#43A047" />,
  <Heart key="h" weight="duotone" size={32} color="#EF5350" />,
  <Star key="s" weight="duotone" size={32} color="#FFD54F" />,
  <TreeEvergreen key="te" weight="duotone" size={32} color="#2E7D32" />,
  <Tree key="t" weight="duotone" size={32} color="#4CAF50" />,
  <Sparkle key="m" weight="duotone" size={32} color="#EF5350" />,
  <Plant key="p" weight="duotone" size={32} color="#66BB6A" />,
];

export default function MemoryMatchPage() {
  const [list, setList] = useState<SpellingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [noList, setNoList] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [isChecking, setIsChecking] = useState(false);
  const [matchMessage, setMatchMessage] = useState('');
  const [showFinal, setShowFinal] = useState(false);
  const [totalPairs, setTotalPairs] = useState(0);

  useEffect(() => {
    const listId = new URLSearchParams(window.location.search).get('listId'); fetch(listId ? `/api/spellings/${listId}` : '/api/spellings?active=true')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.json();
      })
      .then((raw) => { const data: SpellingList[] = Array.isArray(raw) ? raw : [raw];
        if (data.length > 0 && data[0].words.length > 0) {
          setList(data[0]);
          // Set up cards
          const selectedWords = shuffleArray([...data[0].words]).slice(0, 6);
          setTotalPairs(selectedWords.length);
          const cardPairs: Card[] = [];
          selectedWords.forEach((w: SpellingWord, pairIdx: number) => {
            cardPairs.push({
              id: pairIdx * 2,
              word: w.word,
              pairId: pairIdx,
              flipped: false,
              matched: false,
            });
            cardPairs.push({
              id: pairIdx * 2 + 1,
              word: w.word,
              pairId: pairIdx,
              flipped: false,
              matched: false,
            });
          });
          setCards(shuffleArray(cardPairs));
        } else {
          setNoList(true);
        }
      })
      .catch(() => setNoList(true))
      .finally(() => setLoading(false));
  }, []);

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (isChecking) return;
      const card = cards.find((c) => c.id === cardId);
      if (!card || card.matched || flippedIds.includes(cardId)) return;

      playSound('click');
      const newFlipped = [...flippedIds, cardId];
      setFlippedIds(newFlipped);

      if (newFlipped.length === 2) {
        setIsChecking(true);
        const [firstId, secondId] = newFlipped;
        const first = cards.find((c) => c.id === firstId)!;
        const second = cards.find((c) => c.id === secondId)!;

        if (first.pairId === second.pairId) {
          // Match!
          setTimeout(() => {
            playSound('success');
            setMatchMessage('Matched!');
            const newMatched = new Set(matchedPairs);
            newMatched.add(first.pairId);
            setMatchedPairs(newMatched);
            setCards((prev) =>
              prev.map((c) =>
                c.pairId === first.pairId ? { ...c, matched: true } : c
              )
            );
            setFlippedIds([]);
            setIsChecking(false);

            // Record progress
            fetch('/api/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                activity_type: 'spelling_memory',
                activity_ref: first.word,
                result: 'correct',
              }),
            })
              .then(() => fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' } }))
              .catch((err) => console.error('Failed to record progress:', err));

            setTimeout(() => setMatchMessage(''), 1500);

            if (newMatched.size === totalPairs) {
              setTimeout(() => setShowFinal(true), 1000);
            }
          }, 500);
        } else {
          // No match
          setTimeout(() => {
            playSound('whoosh');
            setFlippedIds([]);
            setIsChecking(false);
          }, 1500);
        }
      }
    },
    [cards, flippedIds, isChecking, matchedPairs, totalPairs]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
        <p className="mt-4 text-garden-text-light font-semibold">Setting up your cards...</p>
      </div>
    );
  }

  if (noList || !list) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
      >
        <Breadcrumbs />
        <div className="game-card p-10 text-center max-w-md">
          <span className="text-6xl block mb-4"><Plant weight="duotone" size={64} color="#66BB6A" /></span>
          <h2 className="text-2xl font-extrabold text-garden-text mb-3">No words to practise!</h2>
          <p className="text-garden-text-light text-lg mb-6">Add some spelling words first!</p>
          <Link href="/entry" className="btn-primary text-lg px-8 py-3 no-underline inline-flex items-center gap-2">
            <PencilSimple weight="duotone" size={20} /> Add Words
          </Link>
        </div>
      </motion.div>
    );
  }

  // Grid layout: 3x4 for 6 pairs, adjust for fewer
  const cols = cards.length <= 8 ? 2 : cards.length <= 12 ? 3 : 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <Breadcrumbs />
        <div className="bg-primary-light/20 px-4 py-2 rounded-full font-bold text-garden-text">
          {matchedPairs.size} of {totalPairs} pairs
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-garden-text">Memory Match</h1>
        <p className="mt-1 text-garden-text-light">
          Find the matching word pairs!
        </p>
      </div>

      {/* Match Message */}
      <AnimatePresence>
        {matchMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-2xl font-extrabold text-primary"
          >
            {matchMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Grid */}
      <div
        className={`grid gap-3 justify-center mx-auto w-full ${
          cols <= 2 ? 'grid-cols-2' : cols <= 3 ? 'grid-cols-3 md:grid-cols-4' : 'grid-cols-4'
        }`}
        style={{ maxWidth: cols <= 3 ? Math.max(cols, 3) * 180 : cols * 150 }}
      >
        {cards.map((card) => {
          const isFlipped = flippedIds.includes(card.id) || card.matched;

          return (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              whileTap={!isFlipped ? { scale: 0.95 } : undefined}
              className="relative cursor-pointer aspect-[3/4] min-h-[100px]"
              style={{ perspective: 600 }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute inset-0"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Card Back (face down) */}
                <div
                  className={`
                    absolute inset-0 rounded-2xl flex items-center justify-center
                    text-4xl select-none shadow-md border-2
                    ${card.matched
                      ? 'bg-primary/20 border-primary/30'
                      : 'bg-gradient-to-br from-primary-light to-accent-light border-primary-light/50 hover:shadow-lg'}
                  `}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {CARD_BACKS[card.id % CARD_BACKS.length]}
                </div>

                {/* Card Front (face up) */}
                <div
                  className={`
                    absolute inset-0 rounded-2xl flex items-center justify-center
                    p-2 select-none shadow-md border-2
                    ${card.matched
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-white border-accent text-garden-text'}
                  `}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="text-base sm:text-lg font-extrabold text-center break-all leading-tight">
                    {card.word}
                  </span>
                  {card.matched && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1"
                    >
                      <Sparkle weight="duotone" size={18} color="#FFD54F" />
                    </motion.span>
                  )}
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      <CelebrationOverlay
        show={showFinal}
        message="You matched all the pairs!"
        emoji={<Cards weight="duotone" size={72} color="#9C27B0" />}
        onDismiss={() => setShowFinal(false)}
        navigateBack
      />
    </motion.div>
  );
}
