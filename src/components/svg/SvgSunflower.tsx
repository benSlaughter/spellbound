interface SvgSunflowerProps {
  size?: number;
  color?: string;
  className?: string;
  weight?: string;
}

export function SvgSunflower({ size = 48, color = '#FFD54F', className }: SvgSunflowerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" className={className}>
      {/* Stem */}
      <line x1="128" y1="148" x2="128" y2="244" stroke="#66BB6A" strokeWidth={16} strokeLinecap="round" />
      {/* Leaf */}
      <ellipse
        cx="92" cy="200" rx="24" ry="11"
        fill="#66BB6A" fillOpacity={0.2} stroke="#66BB6A" strokeWidth={10}
        strokeLinejoin="round" transform="rotate(-25 92 200)"
      />
      {/* Petals — 12 pointed */}
      {Array.from({ length: 12 }, (_, i) => i * 30).map((a) => (
        <ellipse
          key={a} cx="128" cy="54" rx="14" ry="40"
          fill={color} fillOpacity={0.2} stroke={color} strokeWidth={16}
          strokeLinecap="round" strokeLinejoin="round"
          transform={`rotate(${a} 128 108)`}
        />
      ))}
      {/* Centre disc */}
      <circle cx="128" cy="108" r="28" fill="#5D4037" stroke={color} strokeWidth={16} />
      {/* Seed dots */}
      <circle cx="120" cy="100" r="3.5" fill="#3E2723" opacity={0.6} />
      <circle cx="136" cy="100" r="3.5" fill="#3E2723" opacity={0.6} />
      <circle cx="128" cy="108" r="3.5" fill="#3E2723" opacity={0.6} />
      <circle cx="120" cy="116" r="3.5" fill="#3E2723" opacity={0.6} />
      <circle cx="136" cy="116" r="3.5" fill="#3E2723" opacity={0.6} />
    </svg>
  );
}
