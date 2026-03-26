interface TreeProps {
  variant?: 'sapling' | 'oak' | 'pine' | 'palm';
  height?: number;
  className?: string;
}

function Sapling({ height, className }: { height: number; className?: string }) {
  const scale = height / 100;
  const w = Math.round(40 * scale);
  return (
    <svg width={w} height={height} viewBox="0 0 40 100" fill="none" className={className}>
      <defs>
        <radialGradient id="sapling-leaves" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#8ED86E" />
          <stop offset="100%" stopColor="#5DAE4C" />
        </radialGradient>
      </defs>
      {/* Thin trunk */}
      <path d="M20 52 L20 92" stroke="#9B7653" strokeWidth="3" strokeLinecap="round" />
      {/* Ground */}
      <ellipse cx="20" cy="92" rx="10" ry="3" fill="#8B6F47" opacity="0.3" />
      {/* Small leaf clusters */}
      <ellipse cx="20" cy="38" rx="12" ry="16" fill="url(#sapling-leaves)" />
      {/* Individual leaves */}
      <path d="M12 36 Q8 28 14 24 Q16 30 12 36Z" fill="#6BC25A" />
      <path d="M28 36 Q32 28 26 24 Q24 30 28 36Z" fill="#6BC25A" />
      <path d="M20 22 Q18 14 22 12 Q24 18 20 22Z" fill="#8ED86E" />
      {/* Leaf highlights */}
      <ellipse cx="17" cy="34" rx="3" ry="5" fill="#A8E88E" opacity="0.4" />
    </svg>
  );
}

function Oak({ height, className }: { height: number; className?: string }) {
  const scale = height / 100;
  const w = Math.round(80 * scale);
  return (
    <svg width={w} height={height} viewBox="0 0 80 100" fill="none" className={className}>
      <defs>
        <radialGradient id="oak-canopy" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#6BC25A" />
          <stop offset="60%" stopColor="#4A8C3B" />
          <stop offset="100%" stopColor="#357A28" />
        </radialGradient>
        <linearGradient id="oak-trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B6F47" />
          <stop offset="50%" stopColor="#9B7653" />
          <stop offset="100%" stopColor="#7A5F3A" />
        </linearGradient>
      </defs>
      {/* Trunk */}
      <path d="M36 60 Q34 75 32 92 L48 92 Q46 75 44 60Z" fill="url(#oak-trunk)" />
      {/* Roots */}
      <path d="M32 92 Q26 94 22 92" stroke="#7A5F3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M48 92 Q54 94 58 92" stroke="#7A5F3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Canopy — overlapping circles for organic shape */}
      <circle cx="40" cy="36" r="24" fill="url(#oak-canopy)" />
      <circle cx="24" cy="40" r="16" fill="#4A8C3B" />
      <circle cx="56" cy="40" r="16" fill="#4A8C3B" />
      <circle cx="32" cy="24" r="14" fill="#5DAE4C" />
      <circle cx="48" cy="24" r="14" fill="#5DAE4C" />
      <circle cx="40" cy="18" r="12" fill="#6BC25A" />
      {/* Light dappling */}
      <circle cx="34" cy="28" r="5" fill="#8ED86E" opacity="0.3" />
      <circle cx="46" cy="34" r="4" fill="#8ED86E" opacity="0.25" />
      <circle cx="28" cy="38" r="3" fill="#8ED86E" opacity="0.2" />
    </svg>
  );
}

function Pine({ height, className }: { height: number; className?: string }) {
  const scale = height / 100;
  const w = Math.round(50 * scale);
  return (
    <svg width={w} height={height} viewBox="0 0 50 100" fill="none" className={className}>
      <defs>
        <linearGradient id="pine-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3D7A2E" />
          <stop offset="100%" stopColor="#2D5E20" />
        </linearGradient>
      </defs>
      {/* Trunk */}
      <rect x="22" y="78" width="6" height="16" rx="2" fill="#8B6F47" />
      {/* Triangular layers — bottom to top */}
      <polygon points="25,8 6,42 44,42" fill="url(#pine-grad)" />
      <polygon points="25,24 10,56 40,56" fill="#357A28" />
      <polygon points="25,40 8,72 42,72" fill="#2D5E20" />
      {/* Snow/light highlights */}
      <path d="M18 36 Q25 32 32 36" stroke="#5DAE4C" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M14 52 Q25 48 36 52" stroke="#4A8C3B" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M12 66 Q25 62 38 66" stroke="#4A8C3B" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
      {/* Top */}
      <circle cx="25" cy="8" r="2" fill="#4A8C3B" />
    </svg>
  );
}

function Palm({ height, className }: { height: number; className?: string }) {
  const scale = height / 100;
  const w = Math.round(70 * scale);
  return (
    <svg width={w} height={height} viewBox="0 0 70 100" fill="none" className={className}>
      <defs>
        <linearGradient id="palm-trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C4956A" />
          <stop offset="50%" stopColor="#A87B50" />
          <stop offset="100%" stopColor="#8B6F47" />
        </linearGradient>
      </defs>
      {/* Curved trunk */}
      <path d="M38 38 Q36 55 34 70 Q32 82 30 94" stroke="url(#palm-trunk)" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Trunk rings */}
      {[48, 56, 64, 72, 80].map((y) => (
        <path key={y} d={`M${32 + (70 - y) * 0.08} ${y} Q${36 + (70 - y) * 0.06} ${y - 1} ${40 + (70 - y) * 0.04} ${y}`} stroke="#7A5F3A" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5" />
      ))}
      {/* Fronds — fan-shaped leaves */}
      <path d="M38 36 Q52 18 62 12 Q56 22 44 34Z" fill="#5DAE4C" />
      <path d="M38 36 Q56 24 64 22 Q56 32 44 38Z" fill="#4A8C3B" />
      <path d="M38 36 Q24 18 8 12 Q18 24 34 34Z" fill="#6BC25A" />
      <path d="M38 36 Q20 24 6 22 Q18 32 34 38Z" fill="#5DAE4C" />
      <path d="M38 36 Q38 14 38 4 Q40 16 40 34Z" fill="#8ED86E" />
      <path d="M38 36 Q50 30 60 32 Q50 36 42 38Z" fill="#4A8C3B" />
      <path d="M38 36 Q26 30 14 32 Q24 36 34 38Z" fill="#4A8C3B" />
      {/* Frond vein lines */}
      <path d="M38 36 Q48 24 56 16" stroke="#357A28" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M38 36 Q28 24 16 16" stroke="#357A28" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />
      {/* Coconuts */}
      <circle cx="36" cy="38" r="3" fill="#A87B50" />
      <circle cx="40" cy="40" r="2.5" fill="#8B6F47" />
    </svg>
  );
}

export function Tree({ variant = 'oak', height = 100, className }: TreeProps) {
  switch (variant) {
    case 'sapling': return <Sapling height={height} className={className} />;
    case 'oak': return <Oak height={height} className={className} />;
    case 'pine': return <Pine height={height} className={className} />;
    case 'palm': return <Palm height={height} className={className} />;
  }
}
