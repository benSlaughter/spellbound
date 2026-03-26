interface RainbowProps {
  size?: number;
  className?: string;
}

const BANDS = [
  '#E84040', // Red
  '#F58C28', // Orange
  '#FFD633', // Yellow
  '#5DAE4C', // Green
  '#4A90D9', // Blue
  '#6B5BAE', // Indigo
  '#9B59B6', // Violet
] as const;

export function Rainbow({ size = 200, className }: RainbowProps) {
  const aspectRatio = 100 / 200;
  const h = Math.round(size * aspectRatio);
  const cx = 100;
  const cy = 95;
  const startR = 88;
  const bandWidth = 7;

  return (
    <svg width={size} height={h} viewBox="0 0 200 100" fill="none" className={className}>
      <defs>
        <clipPath id="rainbow-clip">
          <rect x="0" y="0" width="200" height="95" />
        </clipPath>
      </defs>

      <g clipPath="url(#rainbow-clip)">
        {BANDS.map((color, i) => {
          const r = startR - i * bandWidth;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              stroke={color}
              strokeWidth={bandWidth - 0.5}
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
            />
          );
        })}

        {/* Inner highlight for warmth */}
        <circle
          cx={cx}
          cy={cy}
          r={startR - 3}
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          opacity="0.2"
        />
      </g>

    </svg>
  );
}
