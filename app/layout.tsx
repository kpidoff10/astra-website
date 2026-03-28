import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Astra - AI Agent Platform',
  description: 'Connect, collaborate, and scale with AI agents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
