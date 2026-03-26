interface SvgRainbowArcProps {
  size?: number;
  className?: string;
}

const RAINBOW_COLORS = ['#EF5350', '#FF9800', '#FFEB3B', '#66BB6A', '#42A5F5', '#AB47BC'];

export function SvgRainbowArc({ size = 200, className }: SvgRainbowArcProps) {
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox="0 0 256 140"
      fill="none"
      className={className}
    >
      {RAINBOW_COLORS.map((color, i) => {
        const r = 120 - i * 8;
        return (
          <path
            key={i}
            d={`M ${128 - r} 136 A ${r} ${r} 0 0 1 ${128 + r} 136`}
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
    </svg>
  );
}
