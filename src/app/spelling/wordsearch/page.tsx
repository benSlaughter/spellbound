'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import BackButton from '@/components/ui/BackButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import { playSound } from '@/lib/sounds';
import Link from 'next/link';

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

type Direction = 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up';

interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: Direction;
  positions: [number, number][];
}

interface CellData {
  letter: string;
  row: number;
  col: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDirectionDelta(dir: Direction): [number, number] {
  switch (dir) {
    case 'horizontal': return [0, 1];
    case 'vertical': return [1, 0];
    case 'diagonal-down': return [1, 1];
    case 'diagonal-up': return [-1, 1];
  }
}

function generateWordSearch(words: string[]): { grid: CellData[][]; placed: PlacedWord[]; size: number } {
  const maxWordLen = Math.max(...words.map((w) => w.length));
  const size = Math.max(10, Math.min(15, maxWordLen + 2, words.length + 4));
  const directions: Direction[] = ['horizontal', 'vertical', 'diagonal-down', 'diagonal-up'];

  let bestResult: { grid: string[][]; placed: PlacedWord[] } | null = null;

  // Retry the whole generation up to 5 times to place all words
  for (let attempt = 0; attempt < 5; attempt++) {
    const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
    const placed: PlacedWord[] = [];
    const shuffledWords = shuffleArray([...words]);

    let allPlaced = true;
    for (const word of shuffledWords) {
      const upper = word.toUpperCase();
      let wordPlaced = false;
      const shuffledDirs = shuffleArray([...directions]);

      for (const dir of shuffledDirs) {
        if (wordPlaced) break;
        const [dr, dc] = getDirectionDelta(dir);

        // Collect all valid starting positions
        const starts: [number, number][] = [];
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            const endR = r + dr * (upper.length - 1);
            const endC = c + dc * (upper.length - 1);
            if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
            starts.push([r, c]);
          }
        }

        const shuffledStarts = shuffleArray(starts);
        for (const [sr, sc] of shuffledStarts) {
          let canPlace = true;
          const positions: [number, number][] = [];
          for (let i = 0; i < upper.length; i++) {
            const r = sr + dr * i;
            const c = sc + dc * i;
            positions.push([r, c]);
            if (grid[r][c] !== '' && grid[r][c] !== upper[i]) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            for (let i = 0; i < upper.length; i++) {
              grid[positions[i][0]][positions[i][1]] = upper[i];
            }
            placed.push({
              word: word,
              startRow: sr,
              startCol: sc,
              direction: dir,
              positions,
            });
            wordPlaced = true;
            break;
          }
        }
      }

      if (!wordPlaced) {
        allPlaced = false;
        break;
      }
    }

    if (allPlaced) {
      bestResult = { grid, placed };
      break;
    }
    if (!bestResult || placed.length > bestResult.placed.length) {
      bestResult = { grid, placed };
    }
  }

  const { grid, placed } = bestResult!;

  // Fill empty cells with random letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * 26)];
      }
    }
  }

  const cellGrid: CellData[][] = grid.map((row, r) =>
    row.map((letter, c) => ({ letter, row: r, col: c }))
  );

  return { grid: cellGrid, placed, size };
}

function getCellsBetween(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const [r1, c1] = start;
  const [r2, c2] = end;
  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);
  const steps = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));

  // Must be a straight line (horizontal, vertical, or diagonal)
  if (r1 !== r2 && c1 !== c2 && Math.abs(r2 - r1) !== Math.abs(c2 - c1)) {
    return [];
  }

  const cells: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push([r1 + dr * i, c1 + dc * i]);
  }
  return cells;
}

export default function WordSearchPage() {
  const [list, setList] = useState<SpellingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [noList, setNoList] = useState(false);
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [gridSize, setGridSize] = useState(10);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedStart, setSelectedStart] = useState<[number, number] | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    fetch('/api/spellings?active=true')
      .then((res) => res.json())
      .then((data: SpellingList[]) => {
        if (data.length > 0 && data[0].words.length > 0) {
          setList(data[0]);
          const words = data[0].words.map((w: SpellingWord) => w.word);
          const result = generateWordSearch(words);
          setGrid(result.grid);
          setPlacedWords(result.placed);
          setGridSize(result.size);
        } else {
          setNoList(true);
        }
      })
      .catch(() => setNoList(true))
      .finally(() => setLoading(false));
  }, []);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!selectedStart) {
        setSelectedStart([row, col]);
        setHighlightedCells(new Set([`${row},${col}`]));
        playSound('click');
      } else {
        const cells = getCellsBetween(selectedStart, [row, col]);
        if (cells.length === 0) {
          // Invalid line, reset
          setSelectedStart(null);
          setHighlightedCells(new Set());
          return;
        }

        const selectedWord = cells.map(([r, c]) => grid[r][c].letter).join('');

        // Check if it matches any placed word
        const match = placedWords.find((pw) => {
          const pwUpper = pw.word.toUpperCase();
          return selectedWord === pwUpper && !foundWords.has(pw.word);
        });

        if (match) {
          // Found a word!
          playSound('success');
          const newFound = new Set(foundWords);
          newFound.add(match.word);
          setFoundWords(newFound);

          const newFoundCells = new Set(foundCells);
          cells.forEach(([r, c]) => newFoundCells.add(`${r},${c}`));
          setFoundCells(newFoundCells);

          // Record progress
          fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activity_type: 'spelling_wordsearch',
              activity_ref: match.word,
              result: 'correct',
            }),
          }).then(() => fetch('/api/achievements', { method: 'POST' }));

          if (newFound.size === placedWords.length) {
            setTimeout(() => setShowFinal(true), 800);
          }
        }

        setSelectedStart(null);
        setHighlightedCells(new Set());
      }
    },
    [selectedStart, grid, placedWords, foundWords, foundCells]
  );

  // Preview highlight on hover
  const handleCellHover = useCallback(
    (row: number, col: number) => {
      if (!selectedStart) return;
      const cells = getCellsBetween(selectedStart, [row, col]);
      if (cells.length > 0) {
        setHighlightedCells(new Set(cells.map(([r, c]) => `${r},${c}`)));
      }
    },
    [selectedStart]
  );

  const wordList = useMemo(
    () => placedWords.map((pw) => pw.word),
    [placedWords]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
        <p className="mt-4 text-garden-text-light font-semibold">Building your puzzle...</p>
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
        <BackButton />
        <div className="game-card p-10 text-center max-w-md">
          <span className="text-6xl block mb-4">🌱</span>
          <h2 className="text-2xl font-extrabold text-garden-text mb-3">No words to practise!</h2>
          <p className="text-garden-text-light text-lg mb-6">Add some spelling words first!</p>
          <Link href="/entry" className="btn-primary text-lg px-8 py-3 no-underline">
            ✏️ Add Words
          </Link>
        </div>
      </motion.div>
    );
  }

  const cellSize = gridSize <= 10 ? 'w-8 h-8 text-sm sm:w-10 sm:h-10 sm:text-base' : 'w-7 h-7 text-xs sm:w-8 sm:h-8 sm:text-sm';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <BackButton />
        <div className="bg-primary-light/20 px-4 py-2 rounded-full font-bold text-garden-text">
          {foundWords.size} of {placedWords.length} found
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-garden-text">🧩 Word Search</h1>
        <p className="mt-1 text-garden-text-light">
          Click the first letter, then the last letter of each word!
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Grid */}
        <div className="game-card p-3 sm:p-4 flex-shrink-0 overflow-x-auto">
          <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
            {grid.flat().map((cell) => {
              const key = `${cell.row},${cell.col}`;
              const isFound = foundCells.has(key);
              const isHighlighted = highlightedCells.has(key);
              const isStart = selectedStart && selectedStart[0] === cell.row && selectedStart[1] === cell.col;

              return (
                <motion.button
                  key={key}
                  onClick={() => handleCellClick(cell.row, cell.col)}
                  onMouseEnter={() => handleCellHover(cell.row, cell.col)}
                  whileTap={{ scale: 0.9 }}
                  animate={isFound ? { scale: [1, 1.1, 1] } : {}}
                  className={`
                    ${cellSize} rounded-md font-bold cursor-pointer
                    flex items-center justify-center select-none
                    transition-colors duration-150
                    ${isFound
                      ? 'bg-primary text-white'
                      : isStart
                      ? 'bg-accent text-white ring-2 ring-accent'
                      : isHighlighted
                      ? 'bg-accent-light/60 text-garden-text'
                      : 'bg-garden-card hover:bg-primary-light/20 text-garden-text'}
                  `}
                >
                  {cell.letter}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Word List */}
        <div className="game-card p-4 flex-1">
          <h3 className="text-lg font-bold text-garden-text mb-3">🔎 Find these words:</h3>
          <div className="flex flex-wrap gap-2">
            {wordList.map((word) => {
              const isFound = foundWords.has(word);
              return (
                <motion.div
                  key={word}
                  animate={isFound ? { scale: [1, 1.1, 1] } : {}}
                  className={`
                    px-3 py-1.5 rounded-full font-bold text-sm
                    ${isFound
                      ? 'bg-primary/20 text-primary line-through'
                      : 'bg-garden-card border border-garden-border text-garden-text'}
                  `}
                >
                  {isFound ? '✅ ' : ''}{word}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <CelebrationOverlay
        show={showFinal}
        message="You found all the words! 🌟"
        emoji="🧩"
        onDismiss={() => setShowFinal(false)}
      />
    </motion.div>
  );
}
