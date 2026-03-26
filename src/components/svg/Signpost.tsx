interface SignpostProps {
  size?: number;
  className?: string;
}

export function Signpost({ size = 40, className }: SignpostProps) {
  const h = Math.round(size * (48 / 40));
  return (
    <svg width={size} height={h} viewBox="0 0 40 48" fill="none" className={className}>
      <defs>
        <linearGradient id="sign-post" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B6F47" />
          <stop offset="50%" stopColor="#9B7653" />
          <stop offset="100%" stopColor="#7A5F3A" />
        </linearGradient>
        <linearGradient id="sign-plank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4956A" />
          <stop offset="50%" stopColor="#B8895E" />
          <stop offset="100%" stopColor="#A87B50" />
        </linearGradient>
      </defs>

      {/* Post */}
      <rect x="18" y="10" width="5" height="34" rx="1.5" fill="url(#sign-post)" />

      {/* Post base */}
      <ellipse cx="20.5" cy="44" rx="7" ry="2.5" fill="#8B6F47" opacity="0.3" />

      {/* Post cap */}
      <path d="M17 10 L24 10 L22 6 L19 6Z" fill="#7A5F3A" />

      {/* Plank */}
      <rect x="4" y="16" width="32" height="10" rx="2" fill="url(#sign-plank)" />

      {/* Plank edge shadow */}
      <rect x="4" y="24" width="32" height="2" rx="1" fill="#8B6F47" opacity="0.3" />

      {/* Wood grain lines */}
      <line x1="8" y1="18" x2="8" y2="24" stroke="#9B7653" strokeWidth="0.5" opacity="0.3" />
      <line x1="14" y1="17" x2="14" y2="25" stroke="#9B7653" strokeWidth="0.5" opacity="0.3" />
      <line x1="26" y1="17" x2="26" y2="25" stroke="#9B7653" strokeWidth="0.5" opacity="0.3" />
      <line x1="32" y1="18" x2="32" y2="24" stroke="#9B7653" strokeWidth="0.5" opacity="0.3" />

      {/* Nails */}
      <circle cx="7" cy="21" r="1" fill="#7A5F3A" />
      <circle cx="33" cy="21" r="1" fill="#7A5F3A" />

      {/* Nail highlights */}
      <circle cx="6.7" cy="20.7" r="0.3" fill="#C4956A" opacity="0.5" />
      <circle cx="32.7" cy="20.7" r="0.3" fill="#C4956A" opacity="0.5" />
    </svg>
  );
}
