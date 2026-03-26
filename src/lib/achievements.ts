/** Definition of an unlockable achievement badge. */
export interface Achievement {
  /** Unique identifier for this achievement (snake_case) */
  key: string;
  /** Display title shown on the badge */
  title: string;
  /** Short description of how to earn this achievement */
  description: string;
  /** Phosphor icon name displayed on the badge */
  emoji: string;
  /** Returns true if the player's stats qualify for this achievement */
  check: (stats: PlayerStats) => boolean;
  /** Returns { current, target, label } for progress display */
  progress: (stats: PlayerStats) => { current: number; target: number; label: string };
}

/** Represents a player's cumulative statistics across all activities. */
export interface PlayerStats {
  /** Total number of progress records (games played) */
  totalGamesPlayed: number;
  /** Total spelling words answered correctly */
  totalWordsCorrect: number;
  /** Total maths questions answered correctly */
  totalMathsCorrect: number;
  /** Number of distinct times tables practised */
  uniqueTablesPlayed: number;
  /** Number of spelling lists fully completed */
  spellingListsCompleted: number;
  /** Consecutive days with at least one activity */
  streakDays: number;
  /** Number of distinct game types played (max ~10) */
  uniqueGameTypesPlayed: number;
  /** Number of achievements currently unlocked */
  totalAchievements: number;
}

/**
 * All available achievements in the app.
 * Each achievement defines a condition checked against the player's stats.
 * New achievements are automatically detected by the POST /api/achievements endpoint.
 */
/** Maps achievement keys to Phosphor icon component names. */
export const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_sprout: "Plant",
  word_wizard: "MagicWand",
  super_speller: "Sparkle",
  number_explorer: "Calculator",
  shining_star: "Star",
  butterfly_garden: "Butterfly",
  rainbow_learner: "Rainbow",
  century: "Trophy",
  maths_maestro: "MusicNotes",
  dedicated_learner: "Medal",
};

export const achievements: Achievement[] = [
  {
    key: "first_sprout",
    title: "First Sprout",
    description: "Completed first game",
    emoji: "Plant",
    check: (stats) => stats.totalGamesPlayed >= 1,
    progress: (stats) => ({ current: Math.min(stats.totalGamesPlayed, 1), target: 1, label: 'games played' }),
  },
  {
    key: "word_wizard",
    title: "Word Wizard",
    description: "Practised all words in a spelling list",
    emoji: "MagicWand",
    check: (stats) => stats.spellingListsCompleted >= 1,
    progress: (stats) => ({ current: Math.min(stats.spellingListsCompleted, 1), target: 1, label: 'lists completed' }),
  },
  {
    key: "super_speller",
    title: "Super Speller",
    description: "Practised 50 words total",
    emoji: "Sparkle",
    check: (stats) => stats.totalWordsCorrect >= 50,
    progress: (stats) => ({ current: Math.min(stats.totalWordsCorrect, 50), target: 50, label: 'words' }),
  },
  {
    key: "number_explorer",
    title: "Number Explorer",
    description: "Tried every times table",
    emoji: "Calculator",
    check: (stats) => stats.uniqueTablesPlayed >= 12,
    progress: (stats) => ({ current: Math.min(stats.uniqueTablesPlayed, 12), target: 12, label: 'tables' }),
  },
  {
    key: "shining_star",
    title: "Shining Star",
    description: "5-day practice streak",
    emoji: "Star",
    check: (stats) => stats.streakDays >= 5,
    progress: (stats) => ({ current: Math.min(stats.streakDays, 5), target: 5, label: 'days' }),
  },
  {
    key: "butterfly_garden",
    title: "Butterfly Garden",
    description: "10 achievements unlocked",
    emoji: "Butterfly",
    check: (stats) => stats.totalAchievements >= 10,
    progress: (stats) => ({ current: Math.min(stats.totalAchievements, 10), target: 10, label: 'badges' }),
  },
  {
    key: "rainbow_learner",
    title: "Rainbow Learner",
    description: "Played every game type",
    emoji: "Rainbow",
    check: (stats) => stats.uniqueGameTypesPlayed >= 10,
    progress: (stats) => ({ current: Math.min(stats.uniqueGameTypesPlayed, 10), target: 10, label: 'game types' }),
  },
  {
    key: "century",
    title: "Century Club",
    description: "100 correct answers total",
    emoji: "Trophy",
    check: (stats) => stats.totalWordsCorrect + stats.totalMathsCorrect >= 100,
    progress: (stats) => ({ current: Math.min(stats.totalWordsCorrect + stats.totalMathsCorrect, 100), target: 100, label: 'correct answers' }),
  },
  {
    key: "maths_maestro",
    title: "Maths Maestro",
    description: "50 maths correct",
    emoji: "MusicNotes",
    check: (stats) => stats.totalMathsCorrect >= 50,
    progress: (stats) => ({ current: Math.min(stats.totalMathsCorrect, 50), target: 50, label: 'maths correct' }),
  },
  {
    key: "dedicated_learner",
    title: "Dedicated Learner",
    description: "10-day streak",
    emoji: "Medal",
    check: (stats) => stats.streakDays >= 10,
    progress: (stats) => ({ current: Math.min(stats.streakDays, 10), target: 10, label: 'days' }),
  },
];
