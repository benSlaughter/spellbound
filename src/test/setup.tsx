import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => {
  const actual = vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          // Return a forwardRef component that renders the HTML element
          const MotionComponent = ({
            children,
            whileHover,
            whileTap,
            initial,
            animate,
            exit,
            transition,
            variants,
            ...rest
          }: Record<string, unknown>) => {
            const Tag = prop as keyof JSX.IntrinsicElements;
            return <Tag {...(rest as Record<string, unknown>)}>{children as React.ReactNode}</Tag>;
          };
          MotionComponent.displayName = `motion.${prop}`;
          return MotionComponent;
        },
      }
    ),
  };
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
