'use client';

import { useEffect, useState, useMemo, type ComponentType, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { playSound } from '@/lib/sounds';
import {
  Cloud as PhCloud,
  Butterfly as PhButterfly,
  Sun as PhSun,
  SunDim as PhSunDim,
  Rainbow as PhRainbow,
  FlowerTulip as PhFlowerTulip,
  Tree as PhTree,
  TreeEvergreen as PhTreeEvergreen,
  Plant as PhPlant,
  CloudRain as PhCloudRain,
  Calculator as PhCalculator,
  CalendarDots as PhCalendarDots,
  GameController as PhGameController,
  Fire as PhFire,
  Star as PhStar,
  MagicWand as PhMagicWand,
  Sparkle as PhSparkle,
  Trophy as PhTrophy,
  MusicNotes as PhMusicNotes,
  Medal as PhMedal,
} from '@phosphor-icons/react';
import { SvgDaisy, SvgSunflower, SvgRose, SvgRainbowArc, SvgBee } from '@/components/svg';

// ── Types ──

interface ProgressData {
  totalGamesPlayed: number;
  wordsPractised: number;
  mathsPractised: number;
  streakDays: number;
  statsByType: Array<{
    activity_type: string;
    total: number;
    correct: number;
  }>;
}

interface AchievementData {
  key: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

/** Maps icon name strings from achievements API to Phosphor icon ReactNodes */
const ICON_MAP: Record<string, ReactNode> = {
  Plant: <PhPlant weight="duotone" size={32} color="#66BB6A" />,
  MagicWand: <PhMagicWand weight="duotone" size={32} color="#9C27B0" />,
  Sparkle: <PhSparkle weight="duotone" size={32} color="#FFD54F" />,
  Calculator: <PhCalculator weight="duotone" size={32} color="#FF9800" />,
  Star: <PhStar weight="duotone" size={32} color="#FFD54F" />,
  Butterfly: <PhButterfly weight="duotone" size={32} color="#9C27B0" />,
  Rainbow: <PhRainbow weight="duotone" size={32} color="#E91E63" />,
  Trophy: <PhTrophy weight="duotone" size={32} color="#FFD54F" />,
  MusicNotes: <PhMusicNotes weight="duotone" size={32} color="#2196F3" />,
  Medal: <PhMedal weight="duotone" size={32} color="#FF9800" />,
};

function achievementIcon(emoji: string): ReactNode {
  return ICON_MAP[emoji] ?? <PhStar weight="duotone" size={32} color="#FFD54F" />;
}

// ── Animation variants ──

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

const popIn = {
  hidden: { opacity: 0, scale: 0 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 15 } },
};

// ── Constants ──

interface PlantDef {
  Icon: ComponentType<Record<string, unknown>>;
  color: string;
}

const SPELLING_FLOWERS: PlantDef[] = [
  { Icon: SvgDaisy, color: '#E91E63' },
  { Icon: SvgSunflower, color: '#FFD54F' },
  { Icon: PhFlowerTulip, color: '#AB47BC' },
  { Icon: SvgRose, color: '#F06292' },
];

const MATHS_PLANTS: PlantDef[] = [
  { Icon: PhTreeEvergreen, color: '#43A047' },
  { Icon: PhTree, color: '#81C784' },
  { Icon: PhTree, color: '#4CAF50' },
  { Icon: PhTreeEvergreen, color: '#2E7D32' },
];

const CLOUD_POSITIONS = [
  { top: '8%', delay: 0, duration: 22 },
  { top: '18%', delay: 5, duration: 28 },
  { top: '12%', delay: 12, duration: 25 },
];

// ── Helper components ──

function Cloud({ top, delay, duration }: { top: string; delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{ top }}
      initial={{ left: '-10%' }}
      animate={{ left: '110%' }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <PhCloud weight="duotone" size={64} color="#B0BEC5" />
    </motion.div>
  );
}

function Butterfly({ index }: { index: number }) {
  const positions = [
    { left: '15%', top: '25%' },
    { left: '70%', top: '20%' },
    { left: '45%', top: '35%' },
    { left: '85%', top: '30%' },
    { left: '30%', top: '15%' },
  ];
  const colors = ['#9C27B0', '#E91E63', '#FF9800', '#2196F3', '#4CAF50'];
  const pos = positions[index % positions.length];

  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{ left: pos.left, top: pos.top }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -8, 0, 5, 0],
        x: [0, 6, -4, 8, 0],
      }}
      transition={{
        opacity: { delay: 1 + index * 0.3, duration: 0.5 },
        scale: { delay: 1 + index * 0.3, type: 'spring' },
        y: { duration: 3 + index * 0.5, repeat: Infinity, ease: 'easeInOut' },
        x: { duration: 4 + index * 0.7, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <PhButterfly weight="duotone" size={32} color={colors[index % colors.length]} />
    </motion.div>
  );
}

function Bee({ index }: { index: number }) {
  const positions = [
    { left: '60%', top: '40%' },
    { left: '25%', top: '45%' },
    { left: '80%', top: '35%' },
  ];
  const pos = positions[index % positions.length];

  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{ left: pos.left, top: pos.top }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        y: [0, -5, 3, -8, 0],
        x: [0, 10, -5, 8, -3, 0],
      }}
      transition={{
        opacity: { delay: 1.5 + index * 0.4, duration: 0.4 },
        y: { duration: 2 + index * 0.3, repeat: Infinity, ease: 'easeInOut' },
        x: { duration: 3 + index * 0.5, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <SvgBee size={28} color="#FFC107" />
    </motion.div>
  );
}

function GardenPlant({
  plantDef,
  size,
  left,
  delay,
}: {
  plantDef: PlantDef;
  size: number;
  left: string;
  delay: number;
}) {
  const { Icon, color } = plantDef;

  return (
    <motion.div
      className="absolute bottom-[15%] flex flex-col items-center select-none pointer-events-none"
      style={{ left }}
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 12 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.3, type: 'spring', stiffness: 300 }}
      >
        <Icon weight="duotone" size={size} color={color} />
      </motion.div>
    </motion.div>
  );
}

function Sun({ streakDays }: { streakDays: number }) {
  const intensity = Math.min(1, 0.3 + streakDays * 0.14);
  const glowSize = Math.min(20, 8 + streakDays * 2);
  const SunIcon = intensity < 0.5 ? PhSunDim : PhSun;

  return (
    <motion.div
      className="absolute top-[6%] right-[8%] select-none pointer-events-none"
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 150, damping: 12 }}
      style={{
        filter: `drop-shadow(0 0 ${glowSize}px rgba(255, 200, 0, ${intensity}))`,
      }}
    >
      <SunIcon weight="duotone" size={72} color="#FFB300" />
    </motion.div>
  );
}

function Rainbow() {
  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 select-none pointer-events-none"
      style={{ top: '10%', zIndex: 0 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.7, scale: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 100, damping: 15 }}
    >
      <SvgRainbowArc size={700} />
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
  extra,
  delay,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  extra?: ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="game-card p-5 flex items-center gap-4"
      whileHover={{ scale: 1.02 }}
      transition={{ delay }}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-extrabold text-garden-text">{value}</p>
        <p className="text-sm font-bold text-garden-text-light">{label}</p>
      </div>
      {extra && (
        <span className="flex items-center">{extra}</span>
      )}
    </motion.div>
  );
}

// ── Main component ──

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [achievements, setAchievements] = useState<AchievementData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [progressRes, achievementsRes] = await Promise.all([
          fetch('/api/progress'),
          fetch('/api/achievements'),
        ]);

        if (!progressRes.ok || !achievementsRes.ok) {
          throw new Error('Failed to load data');
        }

        const [progressData, achievementsData] = await Promise.all([
          progressRes.json(),
          achievementsRes.json(),
        ]);

        setProgress(progressData);
        setAchievements(achievementsData);
        playSound('pop');
      } catch {
        setError('Could not load your garden. Try again soon!');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Determine which garden elements to show
  const gardenElements = useMemo(() => {
    if (!progress) return { flowers: [], plants: [], butterflyCount: 0, showBees: false, showRainbow: false };

    const spellingTypes = progress.statsByType.filter((s) =>
      s.activity_type.startsWith('spelling_')
    );
    const mathsTypes = progress.statsByType.filter((s) =>
      s.activity_type.startsWith('maths_')
    );

    const flowers = spellingTypes.map((s, i) => ({
      plantDef: SPELLING_FLOWERS[i % SPELLING_FLOWERS.length],
      size: Math.min(70, 40 + s.total * 3),
      left: `${12 + i * 14}%`,
    }));

    const plants = mathsTypes.map((s, i) => ({
      plantDef: MATHS_PLANTS[i % MATHS_PLANTS.length],
      size: Math.min(120, 60 + s.total * 3),
      left: `${55 + i * 12}%`,
    }));

    const unlockedCount = achievements?.filter((a) => a.unlocked).length ?? 0;
    const butterflyCount = Math.min(5, Math.floor(unlockedCount / 2));

    const allGameTypes = new Set(progress.statsByType.map((s) => s.activity_type));
    const showRainbow = allGameTypes.size >= 4;

    const showBees = progress.streakDays > 3;

    return { flowers, plants, butterflyCount, showBees, showRainbow };
  }, [progress, achievements]);


  const isEmptyGarden =
    progress !== null && progress.totalGamesPlayed === 0;

  // ── Render ──

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner />
        <p className="text-garden-text-light font-bold text-lg">
          Growing your garden…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <PhCloudRain weight="duotone" size={64} color="#78909C" />
        <p className="text-garden-text font-bold text-xl text-center">{error}</p>
        <Breadcrumbs />
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 pb-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Breadcrumbs />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-garden-text">
          My Garden
        </h1>
      </motion.div>

      {/* ── Visual Garden Scene ── */}
      <motion.div
        variants={fadeUp}
        className="relative w-full rounded-2xl overflow-hidden shadow-lg select-none"
        style={{ minHeight: '340px' }}
      >
        {/* Sky gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #87CEEB 0%, #B3E5FC 40%, #E1F5FE 70%, #C8E6C9 85%, #8D6E63 90%, #6D4C41 100%)',
          }}
        />

        {/* Grass layer */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '18%',
            background: 'linear-gradient(180deg, #66BB6A 0%, #43A047 50%, #8D6E63 100%)',
            borderRadius: '60% 60% 0 0 / 30% 30% 0 0',
            zIndex: 10,
          }}
        />

        {/* Soil/ground */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '8%',
            background: '#6D4C41',
            zIndex: 10,
          }}
        />

        {/* Sun */}
        <Sun streakDays={progress?.streakDays ?? 0} />

        {/* Clouds */}
        {CLOUD_POSITIONS.map((cloud, i) => (
          <Cloud key={i} top={cloud.top} delay={cloud.delay} duration={cloud.duration} />
        ))}

        {/* Rainbow (if played all game types) */}
        {gardenElements.showRainbow && <Rainbow />}

        {/* Flowers from spelling */}
        {gardenElements.flowers.map((flower, i) => (
          <GardenPlant
            key={`flower-${i}`}
            plantDef={flower.plantDef}
            size={flower.size}
            left={flower.left}
            delay={0.5 + i * 0.15}
          />
        ))}

        {/* Plants from maths */}
        {gardenElements.plants.map((plant, i) => (
          <GardenPlant
            key={`plant-${i}`}
            plantDef={plant.plantDef}
            size={plant.size}
            left={plant.left}
            delay={0.8 + i * 0.15}
          />
        ))}

        {/* Butterflies (from achievements) */}
        {Array.from({ length: gardenElements.butterflyCount }, (_, i) => (
          <Butterfly key={`butterfly-${i}`} index={i} />
        ))}

        {/* Bees (if streak > 3) */}
        {gardenElements.showBees &&
          Array.from({ length: Math.min(3, Math.floor((progress?.streakDays ?? 0) / 3)) }, (_, i) => (
            <Bee key={`bee-${i}`} index={i} />
          ))}

        {/* Empty garden prompt */}
        <AnimatePresence>
          {isEmptyGarden && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 text-center shadow-md max-w-xs">
                <p className="text-xl font-extrabold text-garden-text mb-1">
                  Your garden is ready!
                </p>
                <p className="text-garden-text-light font-semibold text-sm">
                  Play some games to grow flowers and plants here!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative ground flowers */}
        {!isEmptyGarden && (
          <>
            <motion.div
              className="absolute bottom-[13%] left-[5%] select-none pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1.8 }}
            >
              <SvgDaisy size={24} color="#E91E63" />
            </motion.div>
            <motion.div
              className="absolute bottom-[14%] right-[6%] select-none pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 2.0 }}
            >
              <PhFlowerTulip weight="duotone" size={24} color="#AB47BC" />
            </motion.div>
            <motion.div
              className="absolute bottom-[15%] left-[48%] select-none pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 2.2 }}
            >
              <SvgDaisy size={20} color="#FF8A65" />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* ── Stats Section ── */}
      {progress && (
        <motion.section variants={fadeUp}>
          <h2 className="text-xl font-bold text-garden-text mb-4">
            How your garden is growing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={<PhPlant weight="duotone" size={28} color="#66BB6A" />}
              label="words practised"
              value={progress.wordsPractised}
              delay={0}
            />
            <StatCard
              icon={<PhCalculator weight="duotone" size={28} color="#FF9800" />}
              label="maths facts explored"
              value={progress.mathsPractised}
              delay={0.05}
            />
            <StatCard
              icon={<PhCalendarDots weight="duotone" size={28} color="#2196F3" />}
              label={`day streak${progress.streakDays !== 1 ? '' : ''}`}
              value={progress.streakDays}
              extra={progress.streakDays > 3 ? <PhFire weight="duotone" size={24} color="#FF5722" /> : progress.streakDays > 0 ? <PhStar weight="fill" size={24} color="#FFD54F" /> : undefined}
              delay={0.1}
            />
            <StatCard
              icon={<PhGameController weight="duotone" size={28} color="#9C27B0" />}
              label="games played"
              value={progress.totalGamesPlayed}
              delay={0.15}
            />
          </div>
        </motion.section>
      )}

      {/* ── Achievements Section ── */}
      {achievements && (
        <motion.section variants={fadeUp}>
          <h2 className="text-xl font-bold text-garden-text mb-4">
            My Badges
          </h2>
          <motion.div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-6"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {achievements.map((achievement, i) => (
              <motion.div
                key={achievement.key}
                variants={popIn}
                className="flex flex-col items-center gap-1"
                onAnimationComplete={() => {
                  if (achievement.unlocked && i === 0) {
                    playSound('achievement');
                  }
                }}
              >
                <div className="relative group">
                  <Badge
                    emoji={achievementIcon(achievement.emoji)}
                    title={achievement.title}
                    unlocked={achievement.unlocked}
                    description={achievement.description}
                  />
                  {/* Tooltip for locked badges */}
                  {!achievement.unlocked && (
                    <div className="
                      absolute -top-10 left-1/2 -translate-x-1/2 z-10
                      bg-garden-text text-white text-xs font-bold
                      px-3 py-1.5 rounded-lg whitespace-nowrap
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-200 pointer-events-none
                      shadow-md
                    ">
                      {achievement.description || 'Keep playing to unlock!'}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-garden-text" />
                    </div>
                  )}
                  {/* Unlocked date */}
                  {achievement.unlocked && achievement.unlocked_at && (
                    <p className="text-[10px] text-garden-text-light text-center mt-0.5">
                      {new Date(achievement.unlocked_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Badge progress hint */}
          {achievements.filter((a) => a.unlocked).length === 0 && (
            <motion.p
              variants={fadeUp}
              className="text-center text-garden-text-light mt-4 font-semibold"
            >
              Play some games to start earning badges! Each one is a surprise!
            </motion.p>
          )}
        </motion.section>
      )}


    </motion.div>
  );
}
