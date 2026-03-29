'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function PricingSection() {
  const { t } = useTranslation();

  const planKeys = ['starter', 'pro', 'enterprise'];
  const popularIndex = 1; // Pro is popular

  return (
    <section id="pricing" className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-slate-900 dark:text-white">
          {t('pricing.title')}
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto">
          {t('pricing.description')}
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {planKeys.map((planKey, index) => {
            const isPopular = index === popularIndex;
            return (
              <div
                key={planKey}
                className={`p-8 rounded-lg border-2 transition-all ${
                  isPopular
                    ? 'border-blue-600 bg-white dark:bg-slate-950 shadow-xl'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950'
                }`}
              >
                {isPopular && (
                  <div className="mb-4 inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                  {t(`pricing.${planKey}.name`)}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {t(`pricing.${planKey}.price`)}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {t(`pricing.${planKey}.period`)}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-2 text-sm font-medium">
                  {t(`pricing.${planKey}.description`)}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mb-6 font-semibold">
                  {t(`pricing.${planKey}.agents`)}
                </p>

                <Link
                  href="/subscribe"
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-center transition-colors block mb-8 ${
                    isPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Get Started
                </Link>

                <ul className="space-y-3">
                  <li className="flex items-center text-slate-600 dark:text-slate-400">
                    <span className="mr-3 text-blue-600 dark:text-blue-400">✓</span>
                    {t(`pricing.${planKey}.features`)}
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
