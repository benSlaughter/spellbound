interface BeeProps {
  size?: number;
  className?: string;
}

export function Bee({ size = 32, className }: BeeProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id="bee-body" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFD633" />
          <stop offset="100%" stopColor="#F5B800" />
        </radialGradient>
        <radialGradient id="bee-wing" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D0E8FF" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {/* Wings */}
      <ellipse cx="11" cy="10" rx="6" ry="4" fill="url(#bee-wing)" stroke="#A8C8E8" strokeWidth="0.5" transform="rotate(-20 11 10)" />
      <ellipse cx="21" cy="10" rx="6" ry="4" fill="url(#bee-wing)" stroke="#A8C8E8" strokeWidth="0.5" transform="rotate(20 21 10)" />

      {/* Body */}
      <ellipse cx="16" cy="18" rx="8" ry="9" fill="url(#bee-body)" />

      {/* Stripes */}
      <path d="M9 15 Q16 13.5 23 15" stroke="#3D2510" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M9 19.5 Q16 18 23 19.5" stroke="#3D2510" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M10 24 Q16 22.5 22 24" stroke="#3D2510" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Head */}
      <circle cx="16" cy="10" r="5" fill="#FFD633" />

      {/* Eyes */}
      <circle cx="13.5" cy="9.5" r="1.5" fill="#3D2510" />
      <circle cx="18.5" cy="9.5" r="1.5" fill="#3D2510" />
      <circle cx="14" cy="9" r="0.5" fill="white" />
      <circle cx="19" cy="9" r="0.5" fill="white" />

      {/* Smile */}
      <path d="M13.5 12 Q16 14 18.5 12" stroke="#3D2510" strokeWidth="0.8" strokeLinecap="round" fill="none" />

      {/* Antennae */}
      <path d="M14 6 Q12 2 10 1" stroke="#3D2510" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      <path d="M18 6 Q20 2 22 1" stroke="#3D2510" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      <circle cx="10" cy="1" r="1" fill="#3D2510" />
      <circle cx="22" cy="1" r="1" fill="#3D2510" />

      {/* Stinger */}
      <path d="M16 27 L16 30" stroke="#8B6F47" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
