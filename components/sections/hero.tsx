'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6 inline-block">
          <div className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm font-semibold">
            ✨ {t('hero.badge')}
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
          {t('hero.title')} <span className="text-blue-600 dark:text-blue-400">{t('hero.highlight')}</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
          {t('hero.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('hero.cta')}
          </Link>
          <Link
            href="#features"
            className="px-8 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t('hero.secondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}
