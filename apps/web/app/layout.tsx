import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Platforma Zdieľanej Elektriny',
  description: 'Zdieľaná Elektrina - Platforma pre zdieľanie energie',
};

import { Navigation } from './components/ui/Navigation';
import { Sidebar } from './components/ui/Sidebar';
import { cookies } from 'next/headers';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const isLoggedIn = !!token;

  return (
    <html lang="sk">
      <body className="bg-slate-50 relative text-slate-900">
        {isLoggedIn ? (
          <div className="flex flex-col md:flex-row min-h-screen">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
              {children}
            </main>
          </div>
        ) : (
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}
