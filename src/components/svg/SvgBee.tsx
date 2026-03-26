interface SvgBeeProps {
  size?: number;
  color?: string;
  className?: string;
}

export function SvgBee({ size = 32, color = '#FFC107', className }: SvgBeeProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" className={className}>
      {/* Wings */}
      <ellipse
        cx="80" cy="108" rx="40" ry="24"
        fill={color} fillOpacity={0.2} stroke={color} strokeWidth={16}
        strokeLinejoin="round" transform="rotate(-15 80 108)"
      />
      <ellipse
        cx="176" cy="108" rx="40" ry="24"
        fill={color} fillOpacity={0.2} stroke={color} strokeWidth={16}
        strokeLinejoin="round" transform="rotate(15 176 108)"
      />
      {/* Body */}
      <ellipse cx="128" cy="148" rx="44" ry="64" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={16} />
      {/* Stripes */}
      <line x1="88" y1="136" x2="168" y2="136" stroke={color} strokeWidth={14} strokeLinecap="round" />
      <line x1="88" y1="164" x2="168" y2="164" stroke={color} strokeWidth={14} strokeLinecap="round" />
      <line x1="96" y1="192" x2="160" y2="192" stroke={color} strokeWidth={14} strokeLinecap="round" />
      {/* Antennae */}
      <path d="M116 88 Q104 48 84 36" stroke={color} strokeWidth={12} strokeLinecap="round" fill="none" />
      <path d="M140 88 Q152 48 172 36" stroke={color} strokeWidth={12} strokeLinecap="round" fill="none" />
      {/* Antenna tips */}
      <circle cx="84" cy="36" r="10" fill={color} />
      <circle cx="172" cy="36" r="10" fill={color} />
    </svg>
  );
}
