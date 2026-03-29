'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentLang = languages.find((lang) => lang.code === i18n.language);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
        aria-label="Change language"
      >
        <span>{currentLang?.flag}</span>
        <span className="text-sm font-semibold hidden sm:inline">{currentLang?.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-[150px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${
                i18n.language === lang.code ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
            >
              <span>{lang.flag}</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
