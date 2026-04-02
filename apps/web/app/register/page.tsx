'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        email,
        password,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server vrátil neočakávanú odpoveď. Skontrolujte svoje pripojenie.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Registrácia zlyhala',
        );
      }

      // Automatically redirect to login on success
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Počas registrácie sa vyskytla chyba');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50 text-slate-900 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-6 items-center p-8 bg-white border border-slate-200 rounded-xl shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Registrácia</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {error && <div className="text-red-700 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
          <div className="flex gap-3 w-full">
            <div className="flex flex-col gap-1.5 w-1/2">
               <label className="text-sm font-semibold text-slate-700">Meno</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 text-sm rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 transition-all w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-sm font-semibold text-slate-700">Priezvisko</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="p-2.5 bg-white border border-slate-300 text-sm rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 transition-all w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full mt-1">
            <label className="text-sm font-semibold text-slate-700">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2.5 bg-white border border-slate-300 text-sm rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 transition-all w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
             <label className="text-sm font-semibold text-slate-700">Heslo <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="p-2.5 bg-white border border-slate-300 text-sm rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 transition-all w-full"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 p-2.5 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 w-full"
          >
            {isLoading ? 'Vytváram účet...' : 'Vytvoriť účet'}
          </button>
        </form>
        <p className="text-sm text-slate-600">
          Už máte účet? <a href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline">Prihlásiť sa</a>
        </p>
      </main>
    </div>
  );
}
