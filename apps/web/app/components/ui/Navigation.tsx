'use client';

import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex shrink-0 items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 transition-transform group-hover:scale-110">
                {/* Vonkajší tvar listu */}
                <path d="M12 2C8 6 3 9 3 14a9 9 0 0 0 18 0c0-5-5-8-9-12z" />
                {/* Symbol blesku (elektrina) vo vnútri */}
                <path d="M13 8l-3 4h4l-3 4" />
                {/* Stredová žila listu */}
                <path d="M12 18v1" />
              </svg>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight hidden sm:block">Zdieľaná<span className="text-emerald-600">Elektrina</span></span>
            </Link>
          </div>
          <div className="flex gap-4 items-center">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition"
            >
              Prihlásiť sa
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-semibold bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-sm transition"
            >
              Vytvoriť účet
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
