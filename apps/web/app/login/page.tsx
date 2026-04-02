'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for HTTPOnly cookies across origins locally
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server vrátil neočakávanú odpoveď. Skontrolujte svoje pripojenie.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Prihlásenie zlyhalo');
      }

      // Successful login creates HTTPOnly cookie
      // Using window.location.href instead of router.push ensures
      // the Next.js Client Router Cache is fully reset, 
      // preventing "Back button logs user out" bugs caused by stale page caches.
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Počas prihlásenia sa vyskytla chyba');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50 text-slate-900 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-6 items-center p-8 bg-white border border-slate-200 rounded-xl shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Prihlásenie</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {error && <div className="text-red-700 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2.5 bg-white border border-slate-300 text-sm rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 transition-all w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Heslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-2.5 bg-white border border-slate-300 text-sm rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 transition-all w-full"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 p-2.5 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 w-full"
          >
            {isLoading ? 'Prihlasujem...' : 'Prihlásiť sa'}
          </button>
        </form>
        <p className="text-sm text-slate-600">
          Nemáte účet? <a href="/register" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline">Zaregistrovať sa</a>
        </p>
      </main>
    </div>
  );
}
