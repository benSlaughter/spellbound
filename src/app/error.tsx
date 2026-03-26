'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
      <h2 className="text-2xl font-extrabold text-garden-text">
        Oops! Something went wrong
      </h2>
      <p className="text-garden-text-light max-w-md">
        Don&apos;t worry — just try again and everything should be fine!
      </p>
      <Button variant="primary" size="lg" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
