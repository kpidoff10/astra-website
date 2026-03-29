'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';

// Pages where header should be hidden
const HIDE_HEADER_ROUTES = ['/auth/login', '/auth/register', '/auth/verify'];

export function HeaderWrapper() {
  const pathname = usePathname();
  const shouldHideHeader = HIDE_HEADER_ROUTES.includes(pathname);

  if (shouldHideHeader) {
    return null;
  }

  return <Header />;
}
