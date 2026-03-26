'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  House,
  Books,
  Calculator,
  Plant,
  Gear,
  Sparkle,
  Flower,
  FlowerTulip,
  Leaf,
  FlowerLotus,
  X,
  List,
} from '@phosphor-icons/react';

const navItems: { href: string; label: string; icon: ReactNode }[] = [
  { href: '/', label: 'Home', icon: <House weight="duotone" size={24} /> },
  { href: '/spelling', label: 'Spelling', icon: <Books weight="duotone" size={24} /> },
  { href: '/maths', label: 'Maths', icon: <Calculator weight="duotone" size={24} /> },
  { href: '/progress', label: 'My Garden', icon: <Plant weight="duotone" size={24} /> },
];

const adminItem = { href: '/admin', label: 'Admin', icon: <Gear weight="duotone" size={20} /> };

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const navContent = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold
            transition-colors duration-150 min-h-[48px]
            ${
              isActive(item.href)
                ? 'bg-primary text-white shadow-md'
                : 'text-garden-text hover:bg-primary-light/30'
            }
          `}
        >
          <span className="flex items-center" aria-hidden="true">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </Link>
      ))}

      <div className="my-3 border-t border-garden-border" />

      <Link
        href={adminItem.href}
        onClick={() => setMobileOpen(false)}
        className={`
          flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold
          transition-colors duration-150 min-h-[44px]
          ${
            isActive(adminItem.href)
              ? 'bg-garden-text-light/20 text-garden-text'
              : 'text-garden-text-light hover:bg-garden-text-light/10'
          }
        `}
      >
        <span className="flex items-center" aria-hidden="true">
          {adminItem.icon}
        </span>
        <span>{adminItem.label}</span>
      </Link>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen bg-garden-card border-r border-garden-border p-4">
        <Link href="/" className="flex items-center gap-2 px-4 py-3 mb-6">
          <Sparkle weight="duotone" size={28} color="#FFD54F" />
          <h1 className="text-2xl font-extrabold text-primary-dark tracking-tight">
            SpellBound
          </h1>
        </Link>

        {navContent}

        {/* Decorative garden elements */}
        <div className="mt-auto pt-8 flex justify-center gap-2 opacity-60 select-none">
          <Flower weight="duotone" size={24} color="#FFD54F" />
          <FlowerTulip weight="duotone" size={24} color="#E91E63" />
          <Leaf weight="duotone" size={24} color="#66BB6A" />
          <FlowerLotus weight="duotone" size={24} color="#EF5350" />
        </div>
      </aside>

      {/* Mobile header + hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-garden-card border-b border-garden-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Sparkle weight="duotone" size={24} color="#FFD54F" />
            <h1 className="text-xl font-extrabold text-primary-dark">
              SpellBound
            </h1>
          </Link>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2 rounded-xl hover:bg-primary-light/20 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X weight="bold" size={24} /> : <List weight="bold" size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/30 z-40"
              onClick={() => setMobileOpen(false)}
              style={{ top: '60px' }}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 bottom-0 w-72 bg-garden-card z-50 p-4 shadow-xl overflow-y-auto"
              style={{ top: '60px' }}
            >
              {navContent}
              <div className="mt-6 flex justify-center gap-2 opacity-60 select-none">
                <Flower weight="duotone" size={24} color="#FFD54F" />
                <FlowerTulip weight="duotone" size={24} color="#E91E63" />
                <Leaf weight="duotone" size={24} color="#66BB6A" />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
