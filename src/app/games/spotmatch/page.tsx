'use client';

import { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import Button from '@/components/ui/Button';
import { Cards, Trophy } from '@phosphor-icons/react';
import {
  Star, Heart, Flower, Butterfly, Sun, Moon, Cloud, Tree,
  Fish, Bird, Bug, Leaf, Drop, Lightning, Snowflake, Fire,
  Diamond, Crown, Bell, Gift, Balloon, Cake, Cookie, Pizza,
  Football, Basketball, Bicycle, Rocket, Airplane, Car, Anchor,
} from '@phosphor-icons/react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { playSound } from '@/lib/sounds';

/* ── constants ─────────────────────────────────────────────────── */

const TOTAL_ROUNDS = 10;
const ICONS_PER_CARD = 7;

const ICON_POOL: { Icon: PhosphorIcon; name: string }[] = [
  { Icon: Star, name: 'Star' },
  { Icon: Heart, name: 'Heart' },
  { Icon: Flower, name: 'Flower' },
  { Icon: Butterfly, name: 'Butterfly' },
  { Icon: Sun, name: 'Sun' },
  { Icon: Moon, name: 'Moon' },
  { Icon: Cloud, name: 'Cloud' },
  { Icon: Tree, name: 'Tree' },
  { Icon: Fish, name: 'Fish' },
  { Icon: Bird, name: 'Bird' },
  { Icon: Bug, name: 'Bug' },
  { Icon: Leaf, name: 'Leaf' },
  { Icon: Drop, name: 'Drop' },
  { Icon: Lightning, name: 'Lightning' },
  { Icon: Snowflake, name: 'Snowflake' },
  { Icon: Fire, name: 'Fire' },
  { Icon: Diamond, name: 'Diamond' },
  { Icon: Crown, name: 'Crown' },
  { Icon: Bell, name: 'Bell' },
  { Icon: Gift, name: 'Gift' },
  { Icon: Balloon, name: 'Balloon' },
  { Icon: Cake, name: 'Cake' },
  { Icon: Cookie, name: 'Cookie' },
  { Icon: Pizza, name: 'Pizza' },
  { Icon: Football, name: 'Football' },
  { Icon: Basketball, name: 'Basketball' },
  { Icon: Bicycle, name: 'Bicycle' },
  { Icon: Rocket, name: 'Rocket' },
  { Icon: Airplane, name: 'Airplane' },
  { Icon: Car, name: 'Car' },
  { Icon: Anchor, name: 'Anchor' },
];

const ICON_COLORS = [
  '#E91E63', '#4CAF50', '#2196F3', '#FF9800',
  '#9C27B0', '#009688', '#F44336', '#3F51B5',
  '#00BCD4', '#FF5722', '#8BC34A', '#673AB7',
];

// 1 centre + 6 evenly spaced around in a hexagon ring
const CARD_POSITIONS = [
  { top: '50%', left: '50%' },
  { top: '20%', left: '50%' },
  { top: '35%', left: '76%' },
  { top: '65%', left: '76%' },
  { top: '80%', left: '50%' },
  { top: '65%', left: '24%' },
  { top: '35%', left: '24%' },
];

/* ── types ──────────────────────────────────────────────────────── */

interface CardIcon {
  Icon: PhosphorIcon;
  name: string;
  color: string;
  size: number;
  rotation: number;
  posIndex: number;
}

interface RoundData {
  leftIcons: CardIcon[];
  rightIcons: CardIcon[];
  matchName: string;
}

/* ── helpers ────────────────────────────────────────────────────── */

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomColor(): string {
  return ICON_COLORS[Math.floor(Math.random() * ICON_COLORS.length)];
}

function randomSize(): number {
  return 28 + Math.floor(Math.random() * 17); // 28-44
}

function randomRotation(): number {
  return Math.floor(Math.random() * 51) - 25; // -25 to +25
}

function makeCardIcon(
  icon: (typeof ICON_POOL)[number],
  posIndex: number,
): CardIcon {
  return {
    Icon: icon.Icon,
    name: icon.name,
    color: randomColor(),
    size: randomSize(),
    rotation: randomRotation(),
    posIndex,
  };
}

function generateRound(): RoundData {
  const shuffled = shuffleArray(ICON_POOL);

  const matchIcon = shuffled[0];
  const matchColor = randomColor();
  const leftOnly = shuffled.slice(1, ICONS_PER_CARD);
  const rightOnly = shuffled.slice(ICONS_PER_CARD, ICONS_PER_CARD * 2 - 1);

  const leftPositions = shuffleArray([0, 1, 2, 3, 4, 5, 6]);
  const rightPositions = shuffleArray([0, 1, 2, 3, 4, 5, 6]);

  const leftIcons = shuffleArray(
    [...leftOnly, matchIcon].map((icon, i) => {
      const ci = makeCardIcon(icon, leftPositions[i]);
      if (icon.name === matchIcon.name) ci.color = matchColor;
      return ci;
    }),
  );

  const rightIcons = shuffleArray(
    [...rightOnly, matchIcon].map((icon, i) => {
      const ci = makeCardIcon(icon, rightPositions[i]);
      if (icon.name === matchIcon.name) ci.color = matchColor;
      return ci;
    }),
  );

  return { leftIcons, rightIcons, matchName: matchIcon.name };
}

function formatTime(ms: number): string {
  const secs = ms / 1000;
  const mins = Math.floor(secs / 60);
  const remainder = (secs % 60).toFixed(1);
  return `${String(mins).padStart(2, '0')}:${remainder.padStart(4, '0')}`;
}

/* ── page wrapper ───────────────────────────────────────────────── */

export default function SpotMatchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SpotMatchGame />
    </Suspense>
  );
}

/* ── game component ─────────────────────────────────────────────── */

type GamePhase = 'ready' | 'playing' | 'finished';

const BEST_TIME_KEY = 'spellbound-spotmatch-best';

function SpotMatchGame() {
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [round, setRound] = useState(0);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [matchFlash, setMatchFlash] = useState(false);
  const [shakeIcon, setShakeIcon] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const advanceRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch + load best time
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const saved = localStorage.getItem(BEST_TIME_KEY);
      if (saved) setBestTime(parseInt(saved, 10));
    } catch { /* ignore */ }
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Date.now() - startTimeRef.current);
      }
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    const data = generateRound();
    setRoundData(data);
    setRound(0);
    setMatchFlash(false);
    setShakeIcon(null);
    setElapsed(0);
    setFinalTime(0);
    startTimeRef.current = Date.now();
    setPhase('playing');
    playSound('click');
  }, []);

  const advanceRound = useCallback(() => {
    const nextRound = round + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      const time = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      setFinalTime(time);
      const newBest = bestTime === null || time < bestTime;
      setIsNewBest(newBest);
      if (newBest) {
        setBestTime(time);
        try { localStorage.setItem(BEST_TIME_KEY, String(time)); } catch { /* ignore */ }
      }
      setPhase('finished');
      playSound('achievement');
    } else {
      setRound(nextRound);
      setRoundData(generateRound());
      setMatchFlash(false);
      setShakeIcon(null);
    }
  }, [round, bestTime]);

  const handleTap = useCallback(
    (iconName: string) => {
      if (!roundData || matchFlash) return;

      if (iconName === roundData.matchName) {
        playSound('success');
        setMatchFlash(true);
        advanceRef.current = setTimeout(advanceRound, 500);
      } else {
        playSound('pop');
        setShakeIcon(iconName);
        setTimeout(() => setShakeIcon(null), 400);
      }
    },
    [roundData, matchFlash, advanceRound],
  );

  const handlePlayAgain = useCallback(() => {
    setPhase('ready');
    setRoundData(null);
  }, []);

  if (!mounted) return <LoadingSpinner />;

  /* ── ready screen ───────────────────────────────────────────── */
  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <Breadcrumbs />
        <div className="text-center">
          <h1 className="page-title text-3xl sm:text-4xl flex items-center justify-center gap-2">
            <Cards weight="duotone" size={40} className="text-primary" />
            Spot Match
          </h1>
          <p className="text-garden-text-light mt-2 text-lg">
            Find the matching icon between two cards — fast!
          </p>
          <p className="text-garden-text-light text-sm mt-1">
            {TOTAL_ROUNDS} rounds · Tap the icon that appears on both cards
          </p>
          {bestTime !== null && (
            <p className="text-primary font-bold mt-3">
              Best time: {formatTime(bestTime)}
            </p>
          )}
        </div>
        <Button variant="fun" size="lg" onClick={startGame}>
          Ready? Play!
        </Button>
      </div>
    );
  }

  /* ── finished screen ────────────────────────────────────────── */
  if (phase === 'finished') {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <Breadcrumbs />
        <CelebrationOverlay
          show
          message={`Spot Match champion! ${formatTime(finalTime)}`}
          emoji={<Trophy weight="duotone" size={72} color="#FFD54F" />}
          onDismiss={handlePlayAgain}
          autoCloseMs={6000}
        />
        <div className="text-center mt-4 z-10">
          <p className="text-2xl font-bold text-primary">{formatTime(finalTime)}</p>
          {isNewBest && (
            <p className="text-lg font-extrabold text-fun-orange mt-1">New Best Time!</p>
          )}
          {bestTime !== null && !isNewBest && (
            <p className="text-garden-text-light text-sm mt-1">
              Best time: {formatTime(bestTime)}
            </p>
          )}
          <p className="text-garden-text-light text-sm mt-1">
            You completed {TOTAL_ROUNDS} rounds!
          </p>
          <div className="mt-4">
            <Button variant="fun" size="lg" onClick={handlePlayAgain}>
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── playing screen ─────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-4 pb-12">
      <Breadcrumbs />

      <div className="text-center">
        <h1 className="page-title text-2xl sm:text-3xl flex items-center justify-center gap-2">
          <Cards weight="duotone" size={32} className="text-primary" />
          Spot Match
        </h1>

        {/* Timer */}
        <p className="text-2xl font-mono font-bold text-primary mt-1 tabular-nums">
          {formatTime(elapsed)}
        </p>

        <p className="text-xs text-garden-text-light">
          Round {round + 1} of {TOTAL_ROUNDS}
        </p>
      </div>

      {/* Cards area */}
      {roundData && (
        <motion.div
          key={round}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 px-4"
        >
          <SpotMatchCard
            icons={roundData.leftIcons}
            borderColor="border-primary"
            matchName={roundData.matchName}
            matchFlash={matchFlash}
            shakeIcon={shakeIcon}
            onTap={handleTap}
          />
          <SpotMatchCard
            icons={roundData.rightIcons}
            borderColor="border-accent"
            matchName={roundData.matchName}
            matchFlash={matchFlash}
            shakeIcon={shakeIcon}
            onTap={handleTap}
          />
        </motion.div>
      )}

      {/* Feedback area */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence>
          {matchFlash && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold text-primary"
            >
              ✓ Match!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Spot Match circular card ───────────────────────────────────────── */

interface SpotMatchCardProps {
  icons: CardIcon[];
  borderColor: string;
  matchName: string;
  matchFlash: boolean;
  shakeIcon: string | null;
  onTap: (name: string) => void;
}

function SpotMatchCard({
  icons,
  borderColor,
  matchName,
  matchFlash,
  shakeIcon,
  onTap,
}: SpotMatchCardProps) {
  return (
    <div
      className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-white ${borderColor} border-4 shadow-lg select-none overflow-hidden`}
    >
      {icons.map((item) => {
        const pos = CARD_POSITIONS[item.posIndex];
        const isMatch = item.name === matchName;
        const showGlow = matchFlash && isMatch;
        const isShaking = shakeIcon === item.name;

        return (
          <motion.button
            key={item.name}
            onClick={() => onTap(item.name)}
            className="absolute flex items-center justify-center cursor-pointer"
            style={{
              top: pos.top,
              left: pos.left,
              marginTop: `-${item.size / 2}px`,
              marginLeft: `-${item.size / 2}px`,
            }}
            initial={false}
            animate={{
              rotate: item.rotation,
              scale: showGlow ? 1.3 : 1,
              x: isShaking ? 6 : 0,
            }}
            transition={
              isShaking
                ? { x: { type: 'tween', duration: 0.08, repeat: 4, repeatType: 'mirror' as const } }
                : { type: 'spring', stiffness: 300, damping: 20 }
            }
            aria-label={item.name}
          >
            <span
              className={`rounded-full p-1.5 transition-shadow duration-150 ${
                showGlow ? 'ring-4 ring-yellow-400 bg-yellow-50 shadow-lg' : ''
              }`}
            >
              <item.Icon weight="duotone" size={item.size} color={item.color} />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
