'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  // Highlight the current route
  const isActive = (path: string) => {
    // Exact match for home, startsWith for others to catch sub-pages like /groups/[id]
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex shrink-0 items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 transition-transform group-hover:scale-110">
                <path d="M13 2v14"></path>
                <path d="M7 8l6-6 6 6"></path>
                <path d="M3 22h18"></path>
                <path d="M12 22v-6"></path>
              </svg>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight hidden sm:block">Zdieľaná<span className="text-emerald-600">Elektrina</span></span>
            </Link>
          </div>
          <div className="flex gap-4 sm:gap-8 items-center">
            <Link 
              href="/groups" 
              className={`text-sm font-semibold transition-colors hover:text-emerald-700 ${isActive('/groups') ? 'text-emerald-700 border-b-2 border-emerald-600 pb-[18px] pt-[20px]' : 'text-slate-600 py-5'}`}
            >
              Moje skupiny
            </Link>
            <Link 
              href="/metering-points" 
              className={`text-sm font-semibold transition-colors hover:text-emerald-700 ${isActive('/metering-points') ? 'text-emerald-700 border-b-2 border-emerald-600 pb-[18px] pt-[20px]' : 'text-slate-600 py-5'}`}
            >
              Pripojené miesta (EIC)
            </Link>
            <Link 
              href="/invitations" 
              className={`text-sm font-semibold transition-colors hover:text-emerald-700 ${isActive('/invitations') || isActive('/metering-point-invitations') ? 'text-emerald-700 border-b-2 border-emerald-600 pb-[18px] pt-[20px]' : 'text-slate-600 py-5'}`}
            >
              Pozvánky
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
