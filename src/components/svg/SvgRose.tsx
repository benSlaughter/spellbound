interface SvgRoseProps {
  size?: number;
  color?: string;
  className?: string;
  weight?: string;
}

export function SvgRose({ size = 48, color = '#F06292', className }: SvgRoseProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" className={className}>
      {/* Stem */}
      <line x1="128" y1="176" x2="128" y2="244" stroke="#66BB6A" strokeWidth={12} strokeLinecap="round" />
      {/* Sepals */}
      <path d="M128 176 Q108 168 104 152" stroke="#43A047" strokeWidth={8} strokeLinecap="round" fill="none" />
      <path d="M128 176 Q148 168 152 152" stroke="#43A047" strokeWidth={8} strokeLinecap="round" fill="none" />
      <path d="M128 176 Q118 164 122 148" stroke="#43A047" strokeWidth={6} strokeLinecap="round" fill="none" />
      <path d="M128 176 Q138 164 134 148" stroke="#43A047" strokeWidth={6} strokeLinecap="round" fill="none" />
      {/* Outer petals (duotone fill) */}
      <path d="M128 40 Q80 52 72 104 Q68 132 96 156 Q112 168 128 168 Q144 168 160 156 Q188 132 184 104 Q176 52 128 40Z" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={12} strokeLinejoin="round" />
      {/* Left petal curl */}
      <path d="M88 72 Q72 96 80 128 Q88 148 112 160" stroke={color} strokeWidth={10} strokeLinecap="round" fill="none" />
      {/* Right petal curl */}
      <path d="M168 72 Q184 96 176 128 Q168 148 144 160" stroke={color} strokeWidth={10} strokeLinecap="round" fill="none" />
      {/* Inner petal shadows */}
      <path d="M108 68 Q96 92 104 124 Q110 144 128 152" stroke={color} strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.2} />
      <path d="M148 68 Q160 92 152 124 Q146 144 128 152" stroke={color} strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.2} />
      {/* Spiral centre */}
      <path d="M128 80 Q112 84 108 100 Q104 116 120 128 Q132 136 140 124 Q148 112 140 100 Q134 92 128 96" stroke={color} strokeWidth={8} strokeLinecap="round" fill="none" />
      {/* Centre bud */}
      <circle cx="128" cy="104" r="10" fill={color} />
    </svg>
  );
}
