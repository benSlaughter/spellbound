interface SvgDaisyProps {
  size?: number;
  color?: string;
  className?: string;
  weight?: string;
}

export function SvgDaisy({ size = 48, color = '#E91E63', className }: SvgDaisyProps) {
  // Petal centre sits at 104; bottom petal tip reaches ~138
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" className={className}>
      {/* Stem — starts from bottom of lowest petal */}
      <line x1="128" y1="138" x2="128" y2="244" stroke="#66BB6A" strokeWidth={12} strokeLinecap="round" />
      {/* Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <ellipse
          key={a} cx="128" cy="70" rx="16" ry="34"
          fill={color} fillOpacity={0.2} stroke={color} strokeWidth={12}
          strokeLinecap="round" strokeLinejoin="round"
          transform={`rotate(${a} 128 104)`}
        />
      ))}
      {/* Centre */}
      <circle cx="128" cy="104" r="22" fill="#FFD54F" stroke="#FFC107" strokeWidth={8} />
    </svg>
  );
}
