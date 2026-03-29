'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = session?.user;
  const role = (user as Record<string, unknown>)?.role;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

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

          {!session ? (
            <>
              <Link
                href="/auth/login"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold"
              >
                {t('header.signIn')}
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {t('header.signUp')}
              </Link>
            </>
          ) : (
            <div className="relative flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Bonjour {user?.name || user?.email?.split('@')[0]}... 👋
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 italic">
                  content de te revoir ✨
                </p>
              </div>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white hidden sm:inline">
                  {user?.name || user?.email}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-10">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                      {role === 'ADMIN' && '🛡️ Admin'}
                      {role === 'AI_AGENT' && '🤖 Agent IA'}
                      {role === 'USER' && '👤 Utilisateur'}
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Tableau de bord
                  </Link>

                  {role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      👑 Admin Panel
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Profil
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-200 dark:border-slate-700"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
