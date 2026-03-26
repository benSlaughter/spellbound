interface FlowerProps {
  variant?: 'daisy' | 'sunflower' | 'tulip' | 'rose';
  height?: number;
  className?: string;
}

function Daisy({ height, className }: { height: number; className?: string }) {
  const scale = height / 80;
  const w = Math.round(48 * scale);
  return (
    <svg width={w} height={height} viewBox="0 0 48 80" fill="none" className={className}>
      <defs>
        <radialGradient id="daisy-center" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#F5B800" />
        </radialGradient>
      </defs>
      {/* Stem */}
      <path d={`M24 38 Q22 55 24 ${72}`} stroke="#5DAE4C" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Leaf */}
      <path d="M24 52 Q30 46 36 50 Q30 54 24 52Z" fill="#6BC25A" />
      <path d="M24 58 Q18 52 12 56 Q18 60 24 58Z" fill="#6BC25A" />
      {/* Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <ellipse
          key={angle}
          cx={24 + Math.cos((angle * Math.PI) / 180) * 12}
          cy={24 + Math.sin((angle * Math.PI) / 180) * 12}
          rx="6"
          ry="10"
          fill="white"
          stroke="#F0E6D0"
          strokeWidth="0.5"
          transform={`rotate(${angle} ${24 + Math.cos((angle * Math.PI) / 180) * 12} ${24 + Math.sin((angle * Math.PI) / 180) * 12})`}
        />
      ))}
      {/* Centre */}
      <circle cx="24" cy="24" r="7" fill="url(#daisy-center)" />
      <circle cx="22" cy="22" r="1.2" fill="#E8A800" opacity="0.6" />
      <circle cx="26" cy="23" r="1" fill="#E8A800" opacity="0.5" />
      <circle cx="24" cy="26" r="0.9" fill="#E8A800" opacity="0.5" />
    </svg>
  );
}

function Sunflower({ height, className }: { height: number; className?: string }) {
  const scale = height / 80;
  const w = Math.round(56 * scale);
  return (
    <svg width={w} height={height} viewBox="0 0 56 80" fill="none" className={className}>
      <defs>
        <radialGradient id="sunflower-center" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#8B5E3C" />
          <stop offset="60%" stopColor="#5C3A1E" />
          <stop offset="100%" stopColor="#3D2510" />
        </radialGradient>
      </defs>
      {/* Stem */}
      <path d="M28 36 Q26 55 28 76" stroke="#4A8C3B" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Leaves */}
      <path d="M28 50 Q38 42 44 48 Q36 54 28 50Z" fill="#5DAE4C" />
      <path d="M28 60 Q18 52 10 58 Q18 64 28 60Z" fill="#5DAE4C" />
      {/* Petals — two layers */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <ellipse
          key={`outer-${angle}`}
          cx={28 + Math.cos((angle * Math.PI) / 180) * 14}
          cy={22 + Math.sin((angle * Math.PI) / 180) * 14}
          rx="5"
          ry="10"
          fill="#FFD633"
          stroke="#E6B800"
          strokeWidth="0.4"
          transform={`rotate(${angle} ${28 + Math.cos((angle * Math.PI) / 180) * 14} ${22 + Math.sin((angle * Math.PI) / 180) * 14})`}
        />
      ))}
      {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle) => (
        <ellipse
          key={`inner-${angle}`}
          cx={28 + Math.cos((angle * Math.PI) / 180) * 11}
          cy={22 + Math.sin((angle * Math.PI) / 180) * 11}
          rx="4"
          ry="8"
          fill="#FFCC00"
          stroke="#E6B800"
          strokeWidth="0.3"
          transform={`rotate(${angle} ${28 + Math.cos((angle * Math.PI) / 180) * 11} ${22 + Math.sin((angle * Math.PI) / 180) * 11})`}
        />
      ))}
      {/* Centre with seed pattern */}
      <circle cx="28" cy="22" r="9" fill="url(#sunflower-center)" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={28 + Math.cos((a * Math.PI) / 180) * 4} cy={22 + Math.sin((a * Math.PI) / 180) * 4} r="1" fill="#3D2510" opacity="0.4" />
      ))}
      {[30, 90, 150, 210, 270, 330].map((a) => (
        <circle key={a} cx={28 + Math.cos((a * Math.PI) / 180) * 6} cy={22 + Math.sin((a * Math.PI) / 180) * 6} r="0.8" fill="#3D2510" opacity="0.3" />
      ))}
    </svg>
  );
}

function Tulip({ height, className }: { height: number; className?: string }) {
  const scale = height / 80;
  const w = Math.round(40 * scale);
  return (
    <svg width={w} height={height} viewBox="0 0 40 80" fill="none" className={className}>
      <defs>
        <linearGradient id="tulip-petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B8A" />
          <stop offset="100%" stopColor="#E0435A" />
        </linearGradient>
      </defs>
      {/* Stem */}
      <path d="M20 32 L20 76" stroke="#4A8C3B" strokeWidth="3" strokeLinecap="round" />
      {/* Leaves */}
      <path d="M20 50 Q28 40 32 48 Q26 52 20 50Z" fill="#5DAE4C" />
      <path d="M20 58 Q12 48 8 56 Q14 60 20 58Z" fill="#5DAE4C" />
      {/* Cup-shaped petals */}
      <path d="M20 10 Q8 14 6 28 Q10 34 20 32Z" fill="url(#tulip-petal)" />
      <path d="M20 10 Q32 14 34 28 Q30 34 20 32Z" fill="#FF7E9A" />
      <path d="M20 10 Q14 16 14 28 Q17 34 20 32Z" fill="#E0435A" opacity="0.6" />
      <path d="M20 10 Q26 16 26 28 Q23 34 20 32Z" fill="#FF8FAB" opacity="0.5" />
      {/* Petal highlight */}
      <path d="M16 16 Q18 14 20 16" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" fill="none" />
    </svg>
  );
}

function Rose({ height, className }: { height: number; className?: string }) {
  const scale = height / 80;
  const w = Math.round(44 * scale);
  return (
    <svg width={w} height={height} viewBox="0 0 44 80" fill="none" className={className}>
      <defs>
        <radialGradient id="rose-grad" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FF8FAB" />
          <stop offset="70%" stopColor="#E0435A" />
          <stop offset="100%" stopColor="#C4284E" />
        </radialGradient>
      </defs>
      {/* Stem with thorns */}
      <path d="M22 34 Q20 55 22 76" stroke="#3D7A2E" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M22 46 L26 43" stroke="#3D7A2E" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 56 L18 53" stroke="#3D7A2E" strokeWidth="2" strokeLinecap="round" />
      {/* Leaves */}
      <path d="M22 50 Q30 44 36 50 Q30 54 22 50Z" fill="#5DAE4C" />
      <path d="M22 62 Q14 56 8 62 Q14 66 22 62Z" fill="#5DAE4C" />
      {/* Rose head — layered spiral petals */}
      <circle cx="22" cy="20" r="14" fill="url(#rose-grad)" />
      {/* Outer petals */}
      <path d="M10 16 Q8 10 14 8 Q18 12 14 18Z" fill="#E0435A" />
      <path d="M34 16 Q36 10 30 8 Q26 12 30 18Z" fill="#FF7E9A" />
      <path d="M14 30 Q10 32 10 26 Q14 24 16 28Z" fill="#E0435A" />
      <path d="M30 30 Q34 32 34 26 Q30 24 28 28Z" fill="#D63A55" />
      <path d="M18 8 Q22 4 26 8 Q24 12 20 12Z" fill="#FF8FAB" />
      {/* Inner spiral */}
      <path d="M18 18 Q20 14 24 16 Q26 20 22 22 Q18 22 18 18Z" fill="#C4284E" opacity="0.7" />
      <path d="M20 16 Q22 14 24 18 Q22 20 20 18Z" fill="#FF6B8A" opacity="0.6" />
      {/* Highlight */}
      <ellipse cx="18" cy="14" rx="2" ry="1.5" fill="white" opacity="0.2" />
    </svg>
  );
}

export function Flower({ variant = 'daisy', height = 80, className }: FlowerProps) {
  switch (variant) {
    case 'daisy': return <Daisy height={height} className={className} />;
    case 'sunflower': return <Sunflower height={height} className={className} />;
    case 'tulip': return <Tulip height={height} className={className} />;
    case 'rose': return <Rose height={height} className={className} />;
  }
}
