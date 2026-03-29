'use client';

import Link from 'next/link';

/**
 * Minimal navigation bar for auth pages (login, register, verify)
 * Shows only the logo which links back to home
 */
export function LogoBar() {
  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-4">
      <div className="max-w-6xl mx-auto flex items-center">
        <Link 
          href="/" 
          className="text-2xl font-bold text-slate-900 dark:text-white hover:opacity-80 transition-opacity"
          title="Back to home"
        >
          ✨ Astra
        </Link>
      </div>
    </nav>
  );
}
