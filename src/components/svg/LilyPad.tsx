interface LilyPadProps {
  size?: number;
  showFlower?: boolean;
  className?: string;
}

export function LilyPad({ size = 64, showFlower = false, className }: LilyPadProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <defs>
        <radialGradient id="lilypad-grad" cx="45%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#6BC25A" />
          <stop offset="70%" stopColor="#4A8C3B" />
          <stop offset="100%" stopColor="#357A28" />
        </radialGradient>
        <radialGradient id="lily-flower" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFE6F0" />
          <stop offset="100%" stopColor="#FF8FAB" />
        </radialGradient>
      </defs>

      {/* Water shadow */}
      <ellipse cx="32" cy="36" rx="26" ry="22" fill="#4A90D9" opacity="0.1" />

      {/* Lily pad — circle with wedge cut */}
      <path
        d="M32 8 A24 24 0 1 1 12 22 L32 32 L22 12 A24 24 0 0 1 32 8Z"
        fill="url(#lilypad-grad)"
      />

      {/* Vein lines radiating from centre */}
      <path d="M32 32 L32 10" stroke="#357A28" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      <path d="M32 32 L50 14" stroke="#357A28" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />
      <path d="M32 32 L56 30" stroke="#357A28" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />
      <path d="M32 32 L52 48" stroke="#357A28" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />
      <path d="M32 32 L32 54" stroke="#357A28" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      <path d="M32 32 L12 48" stroke="#357A28" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />
      <path d="M32 32 L8 30" stroke="#357A28" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />

      {/* Edge highlight */}
      <path
        d="M32 8 A24 24 0 1 1 12 22"
        stroke="#8ED86E"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />

      {/* Water droplet */}
      <ellipse cx="38" cy="24" rx="2.5" ry="2" fill="#B8E8FF" opacity="0.5" />
      <ellipse cx="37.5" cy="23.5" rx="1" ry="0.7" fill="white" opacity="0.6" />

      {/* Optional flower */}
      {showFlower && (
        <g>
          {/* Petals */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx={42 + Math.cos((angle * Math.PI) / 180) * 5}
              cy={18 + Math.sin((angle * Math.PI) / 180) * 5}
              rx="3"
              ry="5.5"
              fill="url(#lily-flower)"
              transform={`rotate(${angle} ${42 + Math.cos((angle * Math.PI) / 180) * 5} ${18 + Math.sin((angle * Math.PI) / 180) * 5})`}
            />
          ))}
          {/* Flower centre */}
          <circle cx="42" cy="18" r="3" fill="#FFD633" />
          <circle cx="41" cy="17" r="0.8" fill="#F5B800" opacity="0.5" />
          <circle cx="43" cy="18.5" r="0.6" fill="#F5B800" opacity="0.4" />
        </g>
      )}
    </svg>
  );
}
