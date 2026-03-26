'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BackButton() {
  const router = useRouter();

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={() => router.back()}
      className="
        inline-flex items-center gap-2 px-4 py-2
        text-garden-text-light font-bold rounded-xl
        hover:bg-primary-light/20 transition-colors
        min-h-[44px] cursor-pointer
      "
    >
      <span className="text-xl">←</span>
      <span>Back</span>
    </motion.button>
  );
}
