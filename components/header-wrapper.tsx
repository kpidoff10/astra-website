'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';
import { LogoBar } from './logo-bar';

// Pages where header should be hidden (but show logo bar instead)
const HIDE_HEADER_ROUTES = ['/auth/login', '/auth/register', '/auth/verify'];

export function HeaderWrapper() {
  const pathname = usePathname();
  const shouldHideHeader = HIDE_HEADER_ROUTES.includes(pathname);

  if (shouldHideHeader) {
    // Show minimal logo bar on auth pages
    return <LogoBar />;
  }

  return <Header />;
}
