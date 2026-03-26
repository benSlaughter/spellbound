interface SunProps {
  size?: number;
  intensity?: number;
  className?: string;
}

export function Sun({ size = 80, intensity = 0.7, className }: SunProps) {
  const clamped = Math.max(0, Math.min(1, intensity));
  const rayCount = Math.round(8 + clamped * 8);
  const outerR = 28 + clamped * 4;
  const innerR = 16;

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      <defs>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF7CC" stopOpacity={0.4 + clamped * 0.4} />
          <stop offset="100%" stopColor="#FFD633" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sun-face" cx="45%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="80%" stopColor="#FFD633" />
          <stop offset="100%" stopColor="#F5B800" />
        </radialGradient>
      </defs>

      {/* Outer glow */}
      <circle cx="40" cy="40" r="38" fill="url(#sun-glow)" />

      {/* Rays */}
      {Array.from({ length: rayCount }).map((_, i) => {
        const angle = (i * 360) / rayCount;
        const rad = (angle * Math.PI) / 180;
        const x1 = 40 + Math.cos(rad) * (innerR + 2);
        const y1 = 40 + Math.sin(rad) * (innerR + 2);
        const x2 = 40 + Math.cos(rad) * outerR;
        const y2 = 40 + Math.sin(rad) * outerR;
        const isLong = i % 2 === 0;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={isLong ? x2 : 40 + Math.cos(rad) * (outerR - 4)}
            y2={isLong ? y2 : 40 + Math.sin(rad) * (outerR - 4)}
            stroke="#FFD633"
            strokeWidth={isLong ? 3 : 2}
            strokeLinecap="round"
            opacity={0.6 + clamped * 0.4}
          />
        );
      })}

      {/* Sun disc */}
      <circle cx="40" cy="40" r={innerR} fill="url(#sun-face)" />

      {/* Face — friendly eyes and smile */}
      <circle cx="35" cy="37" r="2" fill="#E8A800" />
      <circle cx="45" cy="37" r="2" fill="#E8A800" />
      <circle cx="35.5" cy="36.5" r="0.7" fill="white" opacity="0.6" />
      <circle cx="45.5" cy="36.5" r="0.7" fill="white" opacity="0.6" />
      <path d="M34 42 Q40 47 46 42" stroke="#E8A800" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Cheek blush */}
      <ellipse cx="32" cy="42" rx="2.5" ry="1.5" fill="#FFB366" opacity="0.4" />
      <ellipse cx="48" cy="42" rx="2.5" ry="1.5" fill="#FFB366" opacity="0.4" />

      {/* Highlight */}
      <ellipse cx="35" cy="30" rx="5" ry="3" fill="white" opacity="0.25" transform="rotate(-15 35 30)" />
    </svg>
  );
}
