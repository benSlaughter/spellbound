interface ButterflyProps {
  color?: string;
  size?: number;
  className?: string;
}

export function Butterfly({ color, size = 40, className }: ButterflyProps) {
  const useCustomColor = !!color;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <defs>
        <linearGradient id="bfly-upper-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={useCustomColor ? color : '#FF8FAB'} />
          <stop offset="100%" stopColor={useCustomColor ? color : '#C77DFF'} />
        </linearGradient>
        <linearGradient id="bfly-upper-r" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={useCustomColor ? color : '#FF8FAB'} />
          <stop offset="100%" stopColor={useCustomColor ? color : '#C77DFF'} />
        </linearGradient>
        <linearGradient id="bfly-lower-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={useCustomColor ? color : '#FFD166'} />
          <stop offset="100%" stopColor={useCustomColor ? color : '#FF8FAB'} />
        </linearGradient>
        <linearGradient id="bfly-lower-r" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={useCustomColor ? color : '#FFD166'} />
          <stop offset="100%" stopColor={useCustomColor ? color : '#FF8FAB'} />
        </linearGradient>
      </defs>

      {/* Upper wings */}
      <path d="M20 18 Q10 4 4 8 Q2 16 8 20 Q12 22 20 20Z" fill="url(#bfly-upper-l)" stroke="#E066A0" strokeWidth="0.5" />
      <path d="M20 18 Q30 4 36 8 Q38 16 32 20 Q28 22 20 20Z" fill="url(#bfly-upper-r)" stroke="#E066A0" strokeWidth="0.5" />

      {/* Lower wings */}
      <path d="M20 22 Q10 26 6 32 Q10 36 16 32 Q18 28 20 24Z" fill="url(#bfly-lower-l)" stroke="#E0A040" strokeWidth="0.5" />
      <path d="M20 22 Q30 26 34 32 Q30 36 24 32 Q22 28 20 24Z" fill="url(#bfly-lower-r)" stroke="#E0A040" strokeWidth="0.5" />

      {/* Wing patterns — dots */}
      <circle cx="10" cy="12" r="2" fill="white" opacity="0.5" />
      <circle cx="30" cy="12" r="2" fill="white" opacity="0.5" />
      <circle cx="8" cy="17" r="1.2" fill="white" opacity="0.35" />
      <circle cx="32" cy="17" r="1.2" fill="white" opacity="0.35" />
      <circle cx="12" cy="30" r="1.5" fill="white" opacity="0.4" />
      <circle cx="28" cy="30" r="1.5" fill="white" opacity="0.4" />

      {/* Wing pattern — curves */}
      <path d="M14 10 Q16 14 14 18" stroke="white" strokeWidth="0.6" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d="M26 10 Q24 14 26 18" stroke="white" strokeWidth="0.6" strokeLinecap="round" fill="none" opacity="0.3" />

      {/* Body */}
      <ellipse cx="20" cy="21" rx="1.8" ry="6" fill="#4A3728" />

      {/* Head */}
      <circle cx="20" cy="14" r="2" fill="#5C3A1E" />

      {/* Antennae */}
      <path d="M19 12 Q16 6 14 4" stroke="#5C3A1E" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      <path d="M21 12 Q24 6 26 4" stroke="#5C3A1E" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="4" r="1" fill="#C77DFF" />
      <circle cx="26" cy="4" r="1" fill="#C77DFF" />
    </svg>
  );
}
