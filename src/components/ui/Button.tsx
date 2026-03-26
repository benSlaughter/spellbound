'use client';

import { useState, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

const FUN_COLORS = ['bg-fun-orange', 'bg-fun-purple', 'bg-fun-pink'] as const;

const variantClasses = {
  primary: 'bg-primary hover:bg-primary-dark text-white',
  secondary: 'bg-secondary hover:bg-secondary-dark text-garden-text',
  fun: 'text-white',
} as const;

const sizeClasses = {
  sm: 'px-4 py-2 text-sm min-h-[36px]',
  md: 'px-5 py-2.5 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[52px]',
} as const;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  emoji?: string;
}

export default function Button({
  variant = 'primary',
  size = 'lg',
  emoji,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const [funIndex, setFunIndex] = useState(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'fun') {
      setFunIndex((i) => (i + 1) % FUN_COLORS.length);
    }
    props.onClick?.(e);
  };

  const colorClass =
    variant === 'fun' ? FUN_COLORS[funIndex] : variantClasses[variant];

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      className={`
        inline-flex items-center justify-center gap-2
        font-bold rounded-full cursor-pointer
        transition-colors duration-150
        ${colorClass}
        ${sizeClasses[size]}
        ${className}
      `}
      onClick={handleClick}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {emoji && (
        <span className="text-xl" role="img" aria-hidden="true">
          {emoji}
        </span>
      )}
      {children}
    </motion.button>
  );
}
