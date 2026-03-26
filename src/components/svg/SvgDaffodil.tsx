interface SvgDaffodilProps {
  size?: number;
  color?: string;
  className?: string;
  weight?: string;
}

/** A daffodil in Phosphor duotone style — 6 pointed petals around a trumpet centre. */
export function SvgDaffodil({ size = 48, color = '#FFD54F', className }: SvgDaffodilProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" className={className}>
      {/* Stem */}
      <line x1="128" y1="160" x2="128" y2="244" stroke="#66BB6A" strokeWidth={12} strokeLinecap="round" />
      {/* 6 pointed petals */}
      <ellipse cx="128" cy="72" rx="14" ry="36" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={10} transform="rotate(0 128 108)" />
      <ellipse cx="128" cy="72" rx="14" ry="36" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={10} transform="rotate(60 128 108)" />
      <ellipse cx="128" cy="72" rx="14" ry="36" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={10} transform="rotate(120 128 108)" />
      <ellipse cx="128" cy="72" rx="14" ry="36" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={10} transform="rotate(180 128 108)" />
      <ellipse cx="128" cy="72" rx="14" ry="36" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={10} transform="rotate(240 128 108)" />
      <ellipse cx="128" cy="72" rx="14" ry="36" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={10} transform="rotate(300 128 108)" />
      {/* Trumpet centre */}
      <circle cx="128" cy="108" r="20" fill="#FF8F00" fillOpacity={0.3} stroke="#FF8F00" strokeWidth={10} />
      <circle cx="128" cy="108" r="10" fill="#FFB300" />
    </svg>
  );
}
