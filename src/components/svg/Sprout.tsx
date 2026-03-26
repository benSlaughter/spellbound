interface SproutProps {
  size?: number;
  className?: string;
}

export function Sprout({ size = 24, className }: SproutProps) {
  const h = Math.round(size * (32 / 24));
  return (
    <svg width={size} height={h} viewBox="0 0 24 32" fill="none" className={className}>
      <defs>
        <linearGradient id="sprout-leaf" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#5DAE4C" />
          <stop offset="100%" stopColor="#8ED86E" />
        </linearGradient>
        <linearGradient id="sprout-soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B6F47" />
          <stop offset="100%" stopColor="#6B5535" />
        </linearGradient>
      </defs>

      {/* Soil mound */}
      <ellipse cx="12" cy="28" rx="10" ry="4" fill="url(#sprout-soil)" />
      {/* Soil texture */}
      <circle cx="8" cy="28" r="1" fill="#7A5F3A" opacity="0.3" />
      <circle cx="14" cy="29" r="0.8" fill="#7A5F3A" opacity="0.3" />
      <circle cx="16" cy="27.5" r="0.6" fill="#7A5F3A" opacity="0.2" />

      {/* Thin stem */}
      <path d="M12 26 Q12 18 12 14" stroke="#5DAE4C" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Left leaf */}
      <path d="M12 16 Q6 12 4 8 Q8 10 12 14Z" fill="url(#sprout-leaf)" />
      {/* Left leaf vein */}
      <path d="M11 15 Q8 12 6 10" stroke="#4A8C3B" strokeWidth="0.4" strokeLinecap="round" fill="none" opacity="0.4" />

      {/* Right leaf */}
      <path d="M12 14 Q18 10 20 6 Q16 8 12 12Z" fill="url(#sprout-leaf)" />
      {/* Right leaf vein */}
      <path d="M13 13 Q16 10 18 8" stroke="#4A8C3B" strokeWidth="0.4" strokeLinecap="round" fill="none" opacity="0.4" />

      {/* Tiny dewdrop */}
      <ellipse cx="8" cy="11" rx="1" ry="1.2" fill="#B8E8FF" opacity="0.5" />
      <ellipse cx="7.8" cy="10.6" rx="0.4" ry="0.4" fill="white" opacity="0.6" />
    </svg>
  );
}
