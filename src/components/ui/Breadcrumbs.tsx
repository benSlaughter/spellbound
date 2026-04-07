'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CaretRight } from '@phosphor-icons/react';

const ROUTE_NAMES: Record<string, string> = {
  '': 'Home',
  'spelling': 'Spelling',
  'scramble': 'Word Scramble',
  'missing': 'Missing Letters',
  'builder': 'Word Builder',
  'wordsearch': 'Word Search',
  'memory': 'Memory Match',
  'maths': 'Maths',
  'bubbles': 'Number Bubbles',
  'mountain': 'Math Mountain',
  'puzzle': 'Puzzle Pieces',
  'river': 'Number River',
  'explorer': 'Times Tables',
  'progress': 'My Garden',
  'games': 'Games',
  'spotmatch': 'Spot Match',
  'entry': 'Add Words',
  'admin': 'Admin',
  'spellings': 'Spellings',
  'settings': 'Settings',
  'tables': 'Times Tables',
  'feedback': 'Feedback',
  'catcher': 'Spell Catcher',
  'volcano': 'Word Volcano',
  'wordal': 'Wordal',
  'maze': 'Math Maze',
  'cascade': 'Number Cascade',
  'game': 'Spot Match',
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = [
    { label: 'Home', href: '/' },
    ...segments.map((seg, i) => ({
      label: ROUTE_NAMES[seg] ?? seg,
      href: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 px-4 py-2 text-sm min-h-[44px]"
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <CaretRight weight="bold" size={14} className="text-garden-text-light/60 select-none" />
            )}
            {isLast ? (
              <span className="font-bold text-garden-text">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-garden-text-light hover:text-primary transition-colors rounded-lg px-1"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
