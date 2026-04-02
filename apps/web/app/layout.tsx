import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Platforma Zdieľanej Elektriny',
  description: 'Zdieľaná Elektrina - Platforma pre zdieľanie energie',
};

import { Navigation } from './components/ui/Navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk">
      <body className="bg-slate-50">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
