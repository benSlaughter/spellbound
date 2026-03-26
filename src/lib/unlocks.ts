export interface GameUnlock {
  /** URL path for the game */
  href: string;
  /** Display title */
  title: string;
  /** Short description */
  description: string;
  /** Phosphor icon component name */
  iconName: string;
  /** Colour for the icon */
  iconColor: string;
  /** Card background colour classes */
  cardColor: string;
  /** Number of total correct answers needed to unlock */
  requiredCorrect: number;
  /** Friendly unlock message shown on locked card */
  unlockMessage: string;
}

export const GAMES_UNLOCKS: GameUnlock[] = [
  {
    href: '/games/spotmatch',
    title: 'Spot Match',
    description:
      'Find the matching icon between two cards — how fast can you go?',
    iconName: 'Cards',
    iconColor: '#9C27B0',
    cardColor: 'bg-fun-purple/10 border-2 border-fun-purple/30',
    requiredCorrect: 20,
    unlockMessage: 'Get 20 correct answers to unlock!',
  },
  // Leave room for future games — add more entries here
];
