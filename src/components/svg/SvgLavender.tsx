interface SvgLavenderProps {
  size?: number;
  color?: string;
  className?: string;
  weight?: string;
}

/** A lavender sprig in Phosphor duotone style — small buds stacked along a thin stem. */
export function SvgLavender({ size = 48, color = '#9575CD', className }: SvgLavenderProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" className={className}>
      {/* Stem */}
      <line x1="128" y1="244" x2="128" y2="80" stroke="#66BB6A" strokeWidth={10} strokeLinecap="round" />
      {/* Buds — stacked pairs going up */}
      <ellipse cx="118" cy="140" rx="12" ry="8" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={8} />
      <ellipse cx="138" cy="140" rx="12" ry="8" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={8} />
      <ellipse cx="116" cy="120" rx="11" ry="7" fill={color} fillOpacity={0.25} stroke={color} strokeWidth={8} />
      <ellipse cx="140" cy="120" rx="11" ry="7" fill={color} fillOpacity={0.25} stroke={color} strokeWidth={8} />
      <ellipse cx="118" cy="100" rx="10" ry="7" fill={color} fillOpacity={0.3} stroke={color} strokeWidth={8} />
      <ellipse cx="138" cy="100" rx="10" ry="7" fill={color} fillOpacity={0.3} stroke={color} strokeWidth={8} />
      {/* Top buds — smaller, tighter */}
      <ellipse cx="122" cy="82" rx="8" ry="6" fill={color} fillOpacity={0.35} stroke={color} strokeWidth={7} />
      <ellipse cx="134" cy="82" rx="8" ry="6" fill={color} fillOpacity={0.35} stroke={color} strokeWidth={7} />
      {/* Tip */}
      <ellipse cx="128" cy="66" rx="6" ry="5" fill={color} stroke={color} strokeWidth={6} />
    </svg>
  );
}
