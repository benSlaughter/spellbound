interface CloudProps {
  variant?: 'small' | 'medium' | 'large';
  className?: string;
}

const configs = {
  small: { width: 48, height: 28, viewBox: '0 0 48 28' },
  medium: { width: 72, height: 40, viewBox: '0 0 72 40' },
  large: { width: 96, height: 52, viewBox: '0 0 96 52' },
} as const;

function SmallCloud() {
  return (
    <>
      <ellipse cx="24" cy="18" rx="16" ry="8" fill="white" />
      <ellipse cx="16" cy="16" rx="10" ry="7" fill="white" />
      <ellipse cx="32" cy="16" rx="10" ry="7" fill="white" />
      <ellipse cx="24" cy="12" rx="10" ry="7" fill="white" />
      {/* Shadow */}
      <ellipse cx="24" cy="20" rx="16" ry="6" fill="#E8E8F0" opacity="0.3" />
    </>
  );
}

function MediumCloud() {
  return (
    <>
      <ellipse cx="36" cy="26" rx="24" ry="10" fill="white" />
      <ellipse cx="22" cy="22" rx="14" ry="10" fill="white" />
      <ellipse cx="50" cy="22" rx="14" ry="10" fill="white" />
      <ellipse cx="30" cy="16" rx="12" ry="9" fill="white" />
      <ellipse cx="44" cy="14" rx="14" ry="10" fill="white" />
      <ellipse cx="36" cy="10" rx="10" ry="8" fill="white" />
      {/* Shadow */}
      <ellipse cx="36" cy="30" rx="22" ry="7" fill="#E0E0EA" opacity="0.25" />
    </>
  );
}

function LargeCloud() {
  return (
    <>
      <ellipse cx="48" cy="36" rx="32" ry="12" fill="white" />
      <ellipse cx="28" cy="30" rx="18" ry="12" fill="white" />
      <ellipse cx="68" cy="30" rx="18" ry="12" fill="white" />
      <ellipse cx="38" cy="22" rx="16" ry="12" fill="white" />
      <ellipse cx="58" cy="20" rx="18" ry="13" fill="white" />
      <ellipse cx="48" cy="14" rx="14" ry="11" fill="white" />
      <ellipse cx="36" cy="12" rx="10" ry="8" fill="white" />
      <ellipse cx="60" cy="12" rx="10" ry="8" fill="white" />
      {/* Shadow */}
      <ellipse cx="48" cy="40" rx="30" ry="8" fill="#D8D8E4" opacity="0.2" />
      {/* Highlight */}
      <ellipse cx="44" cy="10" rx="6" ry="4" fill="white" opacity="0.8" />
    </>
  );
}

export function Cloud({ variant = 'medium', className }: CloudProps) {
  const config = configs[variant];
  return (
    <svg width={config.width} height={config.height} viewBox={config.viewBox} fill="none" className={className}>
      {variant === 'small' && <SmallCloud />}
      {variant === 'medium' && <MediumCloud />}
      {variant === 'large' && <LargeCloud />}
    </svg>
  );
}
