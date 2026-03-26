interface SvgDaisyProps {
  size?: number;
  color?: string;
  className?: string;
  weight?: string;
}

export function SvgDaisy({ size = 48, color = '#E91E63', className }: SvgDaisyProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" className={className}>
      {/* Stem */}
      <line x1="128" y1="136" x2="128" y2="244" stroke={color} strokeWidth={16} strokeLinecap="round" />
      {/* Leaf */}
      <ellipse
        cx="98" cy="196" rx="22" ry="10"
        fill={color} fillOpacity={0.2} stroke={color} strokeWidth={8}
        strokeLinejoin="round" transform="rotate(-30 98 196)"
      />
      {/* Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <ellipse
          key={a} cx="128" cy="62" rx="16" ry="34"
          fill={color} fillOpacity={0.2} stroke={color} strokeWidth={16}
          strokeLinecap="round" strokeLinejoin="round"
          transform={`rotate(${a} 128 104)`}
        />
      ))}
      {/* Centre */}
      <circle cx="128" cy="104" r="22" fill={color} stroke={color} strokeWidth={16} />
    </svg>
  );
}
