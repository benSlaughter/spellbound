interface FrogProps {
  variant?: 'sitting' | 'jumping';
  size?: number;
  className?: string;
}

function SittingFrog() {
  return (
    <>
      <defs>
        <radialGradient id="frog-body" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#6BC25A" />
          <stop offset="100%" stopColor="#4A8C3B" />
        </radialGradient>
        <radialGradient id="frog-belly" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#D4EDCC" />
          <stop offset="100%" stopColor="#B8DCA8" />
        </radialGradient>
      </defs>

      {/* Back legs */}
      <ellipse cx="12" cy="38" rx="8" ry="5" fill="#4A8C3B" transform="rotate(-10 12 38)" />
      <ellipse cx="36" cy="38" rx="8" ry="5" fill="#4A8C3B" transform="rotate(10 36 38)" />
      {/* Feet */}
      <path d="M6 40 Q4 44 2 42 Q4 40 6 40Z" fill="#357A28" />
      <path d="M8 42 Q6 46 4 44 Q6 42 8 42Z" fill="#357A28" />
      <path d="M42 40 Q44 44 46 42 Q44 40 42 40Z" fill="#357A28" />
      <path d="M40 42 Q42 46 44 44 Q42 42 40 42Z" fill="#357A28" />

      {/* Body */}
      <ellipse cx="24" cy="32" rx="14" ry="12" fill="url(#frog-body)" />

      {/* Belly */}
      <ellipse cx="24" cy="36" rx="8" ry="7" fill="url(#frog-belly)" />

      {/* Front legs */}
      <path d="M14 38 Q10 42 8 40" stroke="#4A8C3B" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M34 38 Q38 42 40 40" stroke="#4A8C3B" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Head */}
      <ellipse cx="24" cy="22" rx="12" ry="8" fill="#6BC25A" />

      {/* Eye bumps */}
      <circle cx="16" cy="16" r="5" fill="#6BC25A" />
      <circle cx="32" cy="16" r="5" fill="#6BC25A" />

      {/* Eye whites */}
      <circle cx="16" cy="15" r="3.5" fill="white" />
      <circle cx="32" cy="15" r="3.5" fill="white" />

      {/* Pupils */}
      <circle cx="17" cy="15" r="2" fill="#2D5E20" />
      <circle cx="33" cy="15" r="2" fill="#2D5E20" />
      <circle cx="17.5" cy="14.5" r="0.7" fill="white" />
      <circle cx="33.5" cy="14.5" r="0.7" fill="white" />

      {/* Wide smile */}
      <path d="M16 26 Q24 32 32 26" stroke="#357A28" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Nostrils */}
      <circle cx="21" cy="22" r="0.8" fill="#357A28" />
      <circle cx="27" cy="22" r="0.8" fill="#357A28" />

      {/* Spots */}
      <circle cx="20" cy="30" r="1.5" fill="#4A8C3B" opacity="0.4" />
      <circle cx="28" cy="28" r="1" fill="#4A8C3B" opacity="0.3" />
    </>
  );
}

function JumpingFrog() {
  return (
    <>
      <defs>
        <radialGradient id="frog-body-j" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#6BC25A" />
          <stop offset="100%" stopColor="#4A8C3B" />
        </radialGradient>
      </defs>

      {/* Back legs — extended */}
      <path d="M14 34 Q6 44 2 46 Q4 44 6 42" stroke="#4A8C3B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M34 34 Q42 44 46 46 Q44 44 42 42" stroke="#4A8C3B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Body — slightly tilted up */}
      <ellipse cx="24" cy="26" rx="12" ry="10" fill="url(#frog-body-j)" transform="rotate(-5 24 26)" />

      {/* Belly */}
      <ellipse cx="24" cy="30" rx="7" ry="5" fill="#D4EDCC" />

      {/* Front legs — reaching forward */}
      <path d="M16 28 Q10 22 8 18" stroke="#4A8C3B" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M32 28 Q38 22 40 18" stroke="#4A8C3B" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Head */}
      <ellipse cx="24" cy="16" rx="11" ry="8" fill="#6BC25A" />

      {/* Eye bumps */}
      <circle cx="16" cy="10" r="5" fill="#6BC25A" />
      <circle cx="32" cy="10" r="5" fill="#6BC25A" />

      {/* Eye whites */}
      <circle cx="16" cy="9" r="3.5" fill="white" />
      <circle cx="32" cy="9" r="3.5" fill="white" />

      {/* Pupils — looking up */}
      <circle cx="16" cy="8" r="2" fill="#2D5E20" />
      <circle cx="32" cy="8" r="2" fill="#2D5E20" />
      <circle cx="16.5" cy="7.5" r="0.7" fill="white" />
      <circle cx="32.5" cy="7.5" r="0.7" fill="white" />

      {/* Open mouth — excited */}
      <path d="M18 20 Q24 24 30 20" stroke="#357A28" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Nostrils */}
      <circle cx="21" cy="16" r="0.8" fill="#357A28" />
      <circle cx="27" cy="16" r="0.8" fill="#357A28" />
    </>
  );
}

export function Frog({ variant = 'sitting', size = 48, className }: FrogProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {variant === 'sitting' ? <SittingFrog /> : <JumpingFrog />}
    </svg>
  );
}
