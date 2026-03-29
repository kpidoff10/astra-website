'use client';

import { useTranslation } from 'react-i18next';

export function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      key: 'feature1',
      icon: '🤖',
    },
    {
      key: 'feature2',
      icon: '💬',
    },
    {
      key: 'feature3',
      icon: '📊',
    },
    {
      key: 'feature4',
      icon: '🔐',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-slate-900 dark:text-white">
          {t('features.title')}
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto">
          {t('features.description')}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-900 transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                {t(`features.${feature.key}.title`)}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t(`features.${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
