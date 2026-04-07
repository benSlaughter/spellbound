import Link from 'next/link';
import { House, MagnifyingGlass, TreeEvergreen, Flower } from '@phosphor-icons/react/dist/ssr';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
      <div className="flex items-center gap-3 text-emerald-400">
        <TreeEvergreen weight="duotone" size={48} />
        <MagnifyingGlass weight="duotone" size={56} className="text-amber-400" />
        <Flower weight="duotone" size={48} className="text-pink-400" />
      </div>
      <h2 className="text-2xl font-extrabold text-garden-text">
        Oops! This path doesn&apos;t lead anywhere
      </h2>
      <p className="text-garden-text-light max-w-md">
        Looks like we wandered off the garden trail! Let&apos;s head back and find the right way.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full transition-colors text-lg"
      >
        <House weight="duotone" size={24} />
        Back to the Garden
      </Link>
    </div>
  );
}
