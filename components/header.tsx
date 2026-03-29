'use client';

import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-slate-900 dark:text-white">
          ✨ Astra
        </Link>

        <nav className="hidden md:flex gap-8">
          <a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
            {t('header.features')}
          </a>
          <a href="#pricing" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
            {t('header.pricing')}
          </a>
        </nav>

        <div className="flex gap-3 items-center">
          <ThemeToggle />
          <LanguageSwitcher />
          <Link
            href="/login"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold"
          >
            {t('header.signIn')}
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('header.signUp')}
          </Link>
        </div>
      </div>
    </header>
  );
}
