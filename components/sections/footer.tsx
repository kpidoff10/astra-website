'use client';

import { useTranslation } from 'react-i18next';

export function FooterSection() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Astra</h3>
            <p className="text-slate-400">{t('hero.description')}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('header.features')}</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors cursor-pointer">
                  {t('header.features')}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors cursor-pointer">
                  {t('header.pricing')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <span className="text-slate-500 cursor-not-allowed">About</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Blog</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Contact</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <span className="text-slate-500 cursor-not-allowed">Privacy</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Terms</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Cookies</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="https://twitter.com" className="hover:text-white transition-colors">
              Twitter
            </a>
            <a href="https://github.com" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="https://discord.com" className="hover:text-white transition-colors">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
