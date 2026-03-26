interface SvgTulipProps {
  size?: number;
  color?: string;
  className?: string;
  weight?: string;
}

/** A tulip flower in Phosphor duotone style — cup-shaped petals on a straight stem. */
export function SvgTulip({ size = 48, color = '#AB47BC', className }: SvgTulipProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" className={className}>
      {/* Stem */}
      <line x1="128" y1="150" x2="128" y2="244" stroke="#66BB6A" strokeWidth={12} strokeLinecap="round" />
      {/* Left petal */}
      <path
        d="M128 56 Q88 72 80 120 Q76 142 100 152 Q114 156 128 152"
        fill={color} fillOpacity={0.2} stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Right petal */}
      <path
        d="M128 56 Q168 72 176 120 Q180 142 156 152 Q142 156 128 152"
        fill={color} fillOpacity={0.2} stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Centre petal */}
      <path
        d="M128 44 Q112 80 112 120 Q112 144 128 152 Q144 144 144 120 Q144 80 128 44"
        fill={color} fillOpacity={0.35} stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
