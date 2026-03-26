interface SvgRoseProps {
  size?: number;
  color?: string;
  className?: string;
  weight?: string;
}

/** A poppy flower in Phosphor duotone style — 4 rounded petals around a dark centre. */
export function SvgRose({ size = 48, color = '#EF5350', className }: SvgRoseProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" className={className}>
      {/* Stem */}
      <line x1="128" y1="170" x2="128" y2="244" stroke="#66BB6A" strokeWidth={12} strokeLinecap="round" />
      {/* Petals — 4 large overlapping circles */}
      <circle cx="104" cy="96" r="40" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={12} />
      <circle cx="152" cy="96" r="40" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={12} />
      <circle cx="104" cy="140" r="40" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={12} />
      <circle cx="152" cy="140" r="40" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={12} />
      {/* Dark centre */}
      <circle cx="128" cy="118" r="18" fill="#3E2723" />
      <circle cx="128" cy="118" r="10" fill="#5D4037" />
      {/* Centre dots */}
      <circle cx="122" cy="114" r="3" fill="#8D6E63" />
      <circle cx="134" cy="114" r="3" fill="#8D6E63" />
      <circle cx="128" cy="124" r="3" fill="#8D6E63" />
    </svg>
  );
}
