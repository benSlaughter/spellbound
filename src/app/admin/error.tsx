'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
      <h2 className="text-2xl font-extrabold text-garden-text">
        Something went wrong
      </h2>
      <p className="text-garden-text-light max-w-md">
        There was a problem loading this admin page. Try refreshing.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" size="lg" onClick={reset}>
          Try Again
        </Button>
        <Link href="/admin" className="inline-flex items-center px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-full transition-colors">
          Back to Admin
        </Link>
      </div>
    </div>
  );
}
