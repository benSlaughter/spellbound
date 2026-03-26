interface SvgBluebellProps {
  size?: number;
  color?: string;
  className?: string;
  weight?: string;
}

/** A bluebell flower in Phosphor duotone style — drooping bell-shaped blooms on a curved stem. */
export function SvgBluebell({ size = 48, color = '#5C6BC0', className }: SvgBluebellProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" className={className}>
      {/* Stem — gentle curve */}
      <path d="M128 244 Q128 180 120 140 Q112 110 104 90" stroke="#66BB6A" strokeWidth={10} strokeLinecap="round" fill="none" />
      {/* Top bell */}
      <path
        d="M104 90 Q88 84 80 96 Q72 110 88 118 Q100 122 104 112"
        fill={color} fillOpacity={0.2} stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Middle bell */}
      <path
        d="M112 116 Q96 112 90 124 Q84 138 100 144 Q112 148 114 136"
        fill={color} fillOpacity={0.2} stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Bottom bell */}
      <path
        d="M120 142 Q104 140 100 152 Q96 166 112 170 Q122 172 122 160"
        fill={color} fillOpacity={0.2} stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Bell openings — small lines */}
      <line x1="80" y1="110" x2="76" y2="116" stroke={color} strokeWidth={6} strokeLinecap="round" />
      <line x1="90" y1="138" x2="86" y2="144" stroke={color} strokeWidth={6} strokeLinecap="round" />
      <line x1="100" y1="164" x2="96" y2="170" stroke={color} strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
}
