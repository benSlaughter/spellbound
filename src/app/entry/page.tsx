'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import { playSound } from '@/lib/sounds';

const PLANT_EMOJIS = ['🌱', '🌿', '🍃', '🌸', '🌺', '🌻', '🌷', '🌹', '🪻', '🌼'];

const TAG_COLORS = [
  'bg-primary-light/30 border-primary-light',
  'bg-accent-light/30 border-accent-light',
  'bg-secondary/30 border-secondary',
  'bg-fun-orange/20 border-fun-orange',
  'bg-fun-purple/20 border-fun-purple',
];

export default function EntryPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [listName, setListName] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const addWord = () => {
    const trimmed = currentWord.trim().toLowerCase();
    if (!trimmed) return;
    if (words.includes(trimmed)) {
      setError('You already added that word! Try another one 🌸');
      return;
    }
    setWords((prev) => [...prev, trimmed]);
    setCurrentWord('');
    setError('');
    playSound('pop');
    inputRef.current?.focus();
  };

  const removeWord = (word: string) => {
    setWords((prev) => prev.filter((w) => w !== word));
    playSound('whoosh');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addWord();
    }
  };

  const saveWords = async () => {
    if (!listName.trim()) {
      setError('Give your list a name first! 📝');
      return;
    }
    if (words.length < 3) {
      setError('Add at least 3 words to your list! 🌱');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: listName.trim(),
          words: words.map((w) => ({ word: w })),
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      playSound('achievement');
      setShowCelebration(true);
    } catch {
      setError('Oops! Something went wrong. Try again! 🌧️');
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 max-w-2xl mx-auto"
    >
      <Breadcrumbs />

      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-garden-text">
          Add This Week&apos;s Words
        </h1>
        <p className="mt-2 text-lg text-garden-text-light">
          Type your spelling words below and watch your garden grow!
        </p>
      </div>

      {/* List Name */}
      <div className="game-card p-6">
        <label
          htmlFor="list-name"
          className="block text-lg font-bold text-garden-text mb-2"
        >
          📋 List Name
        </label>
        <input
          id="list-name"
          type="text"
          placeholder="e.g. Week 12 - March"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="w-full px-5 py-3 text-lg rounded-xl border-2 border-garden-border
                     bg-white focus:border-primary focus:outline-none
                     font-semibold text-garden-text placeholder:text-garden-text-light/50"
        />
      </div>

      {/* Word Input */}
      <div className="game-card p-6">
        <label
          htmlFor="word-input"
          className="block text-lg font-bold text-garden-text mb-2"
        >
          🌱 Type a word
        </label>
        <div className="flex gap-3">
          <input
            id="word-input"
            ref={inputRef}
            type="text"
            placeholder="Type a word..."
            value={currentWord}
            onChange={(e) => setCurrentWord(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-5 py-3 text-xl rounded-xl border-2 border-garden-border
                       bg-white focus:border-primary focus:outline-none
                       font-bold text-garden-text placeholder:text-garden-text-light/50"
            autoComplete="off"
            autoCapitalize="off"
          />
          <Button
            variant="primary"
            size="lg"
            emoji="🌱"
            onClick={addWord}
            disabled={!currentWord.trim()}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-error font-bold text-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word Tags */}
      <div className="game-card p-6 min-h-[120px]">
        <h3 className="text-lg font-bold text-garden-text mb-3">
          🌿 Your Words ({words.length})
        </h3>
        {words.length === 0 ? (
          <p className="text-garden-text-light text-center py-4">
            Your word garden is empty — start adding words above! 🌱
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {words.map((word, index) => (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full
                    border-2 font-bold text-garden-text text-lg
                    ${TAG_COLORS[index % TAG_COLORS.length]}
                  `}
                >
                  <span>{PLANT_EMOJIS[index % PLANT_EMOJIS.length]}</span>
                  <span>{word}</span>
                  <button
                    onClick={() => removeWord(word)}
                    className="ml-1 w-7 h-7 rounded-full bg-error/20 text-error
                               flex items-center justify-center text-sm font-bold
                               hover:bg-error/30 transition-colors cursor-pointer"
                    aria-label={`Remove ${word}`}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-center pb-6">
        <Button
          variant="primary"
          size="lg"
          emoji="🌻"
          onClick={saveWords}
          disabled={saving}
          className="text-xl px-10 py-4"
        >
          {saving ? 'Saving...' : 'Save My Words!'}
        </Button>
      </div>

      {/* Validation Helper */}
      {words.length > 0 && words.length < 3 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-garden-text-light font-semibold"
        >
          Add {3 - words.length} more word{3 - words.length > 1 ? 's' : ''} to save your list! 🌸
        </motion.p>
      )}

      <CelebrationOverlay
        show={showCelebration}
        message="Your words are saved! Let's go practise! 🌟"
        emoji="🌻"
        onDismiss={() => router.push('/spelling')}
        autoCloseMs={3000}
      />
    </motion.div>
  );
}
