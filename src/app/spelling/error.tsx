'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function SpellingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Spelling error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
      <h2 className="text-2xl font-extrabold text-garden-text">
        This game had a hiccup!
      </h2>
      <p className="text-garden-text-light max-w-md">
        Don&apos;t worry — try again or pick a different spelling game.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" size="lg" onClick={reset}>
          Try Again
        </Button>
        <Link href="/spelling" className="inline-flex items-center px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-full transition-colors">
          Back to Spelling
        </Link>
      </div>
    </div>
  );
}
