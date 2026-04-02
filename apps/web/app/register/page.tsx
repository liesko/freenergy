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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white">
      <main className="flex flex-col gap-6 items-center p-8 bg-neutral-900 rounded-lg shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Registrácia</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {error && <div className="text-red-500 text-sm p-2 bg-red-500/10 rounded">{error}</div>}
          <div className="flex gap-2 w-full">
            <div className="flex flex-col gap-1 w-1/2">
              <label className="text-sm text-neutral-400">Meno</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="p-2 bg-neutral-800 rounded border border-neutral-700 outline-none focus:border-neutral-500 w-full"
              />
            </div>
            <div className="flex flex-col gap-1 w-1/2">
              <label className="text-sm text-neutral-400">Priezvisko</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="p-2 bg-neutral-800 rounded border border-neutral-700 outline-none focus:border-neutral-500 w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm text-neutral-400">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2 bg-neutral-800 rounded border border-neutral-700 outline-none focus:border-neutral-500 w-full"
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm text-neutral-400">Heslo <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="p-2 bg-neutral-800 rounded border border-neutral-700 outline-none focus:border-neutral-500 w-full"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 p-2 bg-white text-black font-semibold rounded hover:bg-neutral-200 transition disabled:opacity-50"
          >
            {isLoading ? 'Vytváram účet...' : 'Vytvoriť účet'}
          </button>
        </form>
        <p className="text-sm text-neutral-400">
          Už máte účet? <a href="/login" className="text-white hover:underline">Prihlásiť sa</a>
        </p>
      </main>
    </div>
  );
}
