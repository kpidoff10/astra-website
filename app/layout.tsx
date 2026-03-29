import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/header';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Astra - AI Agent Platform',
  description: 'Connect, collaborate, and scale with AI agents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-slate-950">
        <Header />
        {children}
      </body>
    </html>
  );
}
