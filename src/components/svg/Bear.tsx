interface BearProps {
  size?: number;
  className?: string;
}

export function Bear({ size = 48, className }: BearProps) {
  const h = Math.round(size * (56 / 48));
  return (
    <svg width={size} height={h} viewBox="0 0 48 56" fill="none" className={className}>
      <defs>
        <radialGradient id="bear-body" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#C4956A" />
          <stop offset="100%" stopColor="#9B7653" />
        </radialGradient>
        <radialGradient id="bear-head" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#C4956A" />
          <stop offset="100%" stopColor="#A87B50" />
        </radialGradient>
      </defs>

      {/* Ears */}
      <circle cx="12" cy="8" r="6" fill="#A87B50" />
      <circle cx="36" cy="8" r="6" fill="#A87B50" />
      {/* Inner ears */}
      <circle cx="12" cy="8" r="3.5" fill="#D4A574" />
      <circle cx="36" cy="8" r="3.5" fill="#D4A574" />

      {/* Body */}
      <ellipse cx="24" cy="40" rx="14" ry="14" fill="url(#bear-body)" />

      {/* Belly patch */}
      <ellipse cx="24" cy="42" rx="9" ry="10" fill="#D4A574" opacity="0.6" />

      {/* Arms */}
      <path d="M12 36 Q6 40 8 46" stroke="#A87B50" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M36 36 Q42 40 40 46" stroke="#A87B50" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* Feet */}
      <ellipse cx="16" cy="52" rx="5" ry="3" fill="#8B6F47" />
      <ellipse cx="32" cy="52" rx="5" ry="3" fill="#8B6F47" />
      {/* Toe pads */}
      <circle cx="13" cy="51" r="1" fill="#D4A574" opacity="0.6" />
      <circle cx="16" cy="50.5" r="1" fill="#D4A574" opacity="0.6" />
      <circle cx="19" cy="51" r="1" fill="#D4A574" opacity="0.6" />
      <circle cx="29" cy="51" r="1" fill="#D4A574" opacity="0.6" />
      <circle cx="32" cy="50.5" r="1" fill="#D4A574" opacity="0.6" />
      <circle cx="35" cy="51" r="1" fill="#D4A574" opacity="0.6" />

      {/* Head */}
      <circle cx="24" cy="18" r="12" fill="url(#bear-head)" />

      {/* Muzzle */}
      <ellipse cx="24" cy="22" rx="6" ry="4.5" fill="#D4A574" />

      {/* Eyes */}
      <circle cx="19" cy="16" r="2.2" fill="#3D2510" />
      <circle cx="29" cy="16" r="2.2" fill="#3D2510" />
      <circle cx="19.7" cy="15.3" r="0.7" fill="white" opacity="0.6" />
      <circle cx="29.7" cy="15.3" r="0.7" fill="white" opacity="0.6" />

      {/* Nose */}
      <ellipse cx="24" cy="20" rx="2.5" ry="1.8" fill="#5C3A1E" />
      <ellipse cx="23.5" cy="19.5" rx="0.8" ry="0.5" fill="white" opacity="0.3" />

      {/* Mouth */}
      <path d="M24 21.8 L24 23" stroke="#5C3A1E" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M21 23.5 Q24 26 27 23.5" stroke="#5C3A1E" strokeWidth="0.8" strokeLinecap="round" fill="none" />

      {/* Cheek blush */}
      <ellipse cx="16" cy="22" rx="2.5" ry="1.5" fill="#E8A8A8" opacity="0.3" />
      <ellipse cx="32" cy="22" rx="2.5" ry="1.5" fill="#E8A8A8" opacity="0.3" />
    </svg>
  );
}
