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
      <line x1="128" y1="152" x2="128" y2="244" stroke="#66BB6A" strokeWidth={16} strokeLinecap="round" />
      {/* Thorn */}
      <line x1="128" y1="188" x2="112" y2="176" stroke="#66BB6A" strokeWidth={8} strokeLinecap="round" />
      <line x1="128" y1="220" x2="144" y2="208" stroke="#66BB6A" strokeWidth={8} strokeLinecap="round" />
      {/* Leaf */}
      <ellipse
        cx="100" cy="204" rx="22" ry="10"
        fill="#66BB6A" fillOpacity={0.2} stroke="#66BB6A" strokeWidth={8}
        strokeLinejoin="round" transform="rotate(-30 100 204)"
      />
      {/* Bloom */}
      <circle cx="128" cy="88" r="56" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={16} />
      {/* Petal curves */}
      <path d="M96 60 Q128 36 160 60" stroke={color} strokeWidth={16} strokeLinecap="round" fill="none" />
      <path d="M80 96 Q80 52 128 52" stroke={color} strokeWidth={14} strokeLinecap="round" fill="none" />
      <path d="M128 52 Q176 52 176 96" stroke={color} strokeWidth={14} strokeLinecap="round" fill="none" />
      {/* Centre bud */}
      <circle cx="128" cy="84" r="16" fill={color} />
    </svg>
  );
}
