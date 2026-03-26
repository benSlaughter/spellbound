/** Definition of an unlockable achievement badge. */
export interface Achievement {
  /** Unique identifier for this achievement (snake_case) */
  key: string;
  /** Display title shown on the badge */
  title: string;
  /** Short description of how to earn this achievement */
  description: string;
  /** Emoji icon displayed on the badge */
  emoji: string;
  /** Returns true if the player's stats qualify for this achievement */
  check: (stats: PlayerStats) => boolean;
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
export const achievements: Achievement[] = [
  {
    key: "first_sprout",
    title: "First Sprout",
    description: "Completed first game",
    emoji: "🌱",
    check: (stats) => stats.totalGamesPlayed >= 1,
  },
  {
    key: "word_wizard",
    title: "Word Wizard",
    description: "Practised all words in a spelling list",
    emoji: "🧙",
    check: (stats) => stats.spellingListsCompleted >= 1,
  },
  {
    key: "super_speller",
    title: "Super Speller",
    description: "Practised 50 words total",
    emoji: "✨",
    check: (stats) => stats.totalWordsCorrect >= 50,
  },
  {
    key: "number_explorer",
    title: "Number Explorer",
    description: "Tried every times table",
    emoji: "🔢",
    check: (stats) => stats.uniqueTablesPlayed >= 12,
  },
  {
    key: "shining_star",
    title: "Shining Star",
    description: "5-day practice streak",
    emoji: "⭐",
    check: (stats) => stats.streakDays >= 5,
  },
  {
    key: "butterfly_garden",
    title: "Butterfly Garden",
    description: "10 achievements unlocked",
    emoji: "🦋",
    check: (stats) => stats.totalAchievements >= 10,
  },
  {
    key: "rainbow_learner",
    title: "Rainbow Learner",
    description: "Played every game type",
    emoji: "🌈",
    check: (stats) => stats.uniqueGameTypesPlayed >= 10,
  },
  {
    key: "century",
    title: "Century Club",
    description: "100 correct answers total",
    emoji: "💯",
    check: (stats) => stats.totalWordsCorrect + stats.totalMathsCorrect >= 100,
  },
  {
    key: "maths_maestro",
    title: "Maths Maestro",
    description: "50 maths correct",
    emoji: "🎵",
    check: (stats) => stats.totalMathsCorrect >= 50,
  },
  {
    key: "dedicated_learner",
    title: "Dedicated Learner",
    description: "10-day streak",
    emoji: "🏆",
    check: (stats) => stats.streakDays >= 10,
  },
];
