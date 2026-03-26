interface OwlProps {
  size?: number;
  className?: string;
}

export function Owl({ size = 48, className }: OwlProps) {
  const h = Math.round(size * (56 / 48));
  return (
    <svg width={size} height={h} viewBox="0 0 48 56" fill="none" className={className}>
      <defs>
        <radialGradient id="owl-body" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#C4956A" />
          <stop offset="100%" stopColor="#8B6F47" />
        </radialGradient>
        <radialGradient id="owl-face" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5E6D0" />
          <stop offset="100%" stopColor="#E8D4B8" />
        </radialGradient>
      </defs>

      {/* Ear tufts */}
      <path d="M14 8 Q10 2 8 0 Q12 4 16 8Z" fill="#A87B50" />
      <path d="M34 8 Q38 2 40 0 Q36 4 32 8Z" fill="#A87B50" />

      {/* Body */}
      <ellipse cx="24" cy="36" rx="16" ry="16" fill="url(#owl-body)" />

      {/* Wing feather patterns */}
      <path d="M10 30 Q8 36 10 42" stroke="#7A5F3A" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M12 28 Q10 34 12 40" stroke="#7A5F3A" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d="M38 30 Q40 36 38 42" stroke="#7A5F3A" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M36 28 Q38 34 36 40" stroke="#7A5F3A" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.3" />

      {/* Belly feathers — scallop pattern */}
      <path d="M18 38 Q20 36 22 38" stroke="#D4A574" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M22 38 Q24 36 26 38" stroke="#D4A574" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M26 38 Q28 36 30 38" stroke="#D4A574" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M16 42 Q18 40 20 42" stroke="#D4A574" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M20 42 Q22 40 24 42" stroke="#D4A574" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M24 42 Q26 40 28 42" stroke="#D4A574" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M28 42 Q30 40 32 42" stroke="#D4A574" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />

      {/* Head */}
      <circle cx="24" cy="18" r="14" fill="#A87B50" />

      {/* Face disc */}
      <ellipse cx="24" cy="20" rx="11" ry="10" fill="url(#owl-face)" />

      {/* Eye circles */}
      <circle cx="18" cy="18" r="5" fill="white" stroke="#C4956A" strokeWidth="1" />
      <circle cx="30" cy="18" r="5" fill="white" stroke="#C4956A" strokeWidth="1" />

      {/* Pupils — large, wise */}
      <circle cx="18" cy="18" r="3" fill="#3D2510" />
      <circle cx="30" cy="18" r="3" fill="#3D2510" />
      <circle cx="19" cy="17" r="1" fill="white" />
      <circle cx="31" cy="17" r="1" fill="white" />

      {/* Graduation cap */}
      <polygon points="24,4 10,10 24,12 38,10" fill="#3D2510" />
      <rect x="22" y="2" width="4" height="4" rx="1" fill="#3D2510" />
      {/* Tassel */}
      <path d="M38 10 Q40 12 38 16" stroke="#FFD633" strokeWidth="1" strokeLinecap="round" fill="none" />
      <circle cx="38" cy="16" r="1.2" fill="#FFD633" />

      {/* Beak */}
      <path d="M22 22 L24 26 L26 22Z" fill="#F5B800" />

      {/* Feet */}
      <path d="M18 50 Q16 54 14 52" stroke="#F5B800" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M18 50 Q18 54 16 54" stroke="#F5B800" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M18 50 Q20 54 18 54" stroke="#F5B800" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M30 50 Q28 54 26 52" stroke="#F5B800" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M30 50 Q30 54 28 54" stroke="#F5B800" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M30 50 Q32 54 30 54" stroke="#F5B800" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
