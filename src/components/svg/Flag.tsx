interface FlagProps {
  size?: number;
  className?: string;
}

export function Flag({ size = 24, className }: FlagProps) {
  const h = Math.round(size * (32 / 24));
  return (
    <svg width={size} height={h} viewBox="0 0 24 32" fill="none" className={className}>
      <defs>
        <linearGradient id="flag-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6B4A" />
          <stop offset="100%" stopColor="#E84040" />
        </linearGradient>
      </defs>

      {/* Pole */}
      <line x1="4" y1="2" x2="4" y2="30" stroke="#A87B50" strokeWidth="2.5" strokeLinecap="round" />

      {/* Pole cap */}
      <circle cx="4" cy="2" r="2" fill="#FFD633" />

      {/* Triangular flag */}
      <path d="M5 4 L22 10 L5 16Z" fill="url(#flag-grad)" />

      {/* Flag detail — subtle wave highlight */}
      <path d="M7 7 Q12 9 7 12" stroke="white" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.3" />

      {/* Flag detail — star */}
      <path d="M12 10 L13 8.5 L14 10 L13 9Z" fill="#FFD633" opacity="0.6" />

      {/* Ground */}
      <ellipse cx="4" cy="30" rx="4" ry="1.5" fill="#8B6F47" opacity="0.3" />
    </svg>
  );
}
