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
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Počas prihlásenia sa vyskytla chyba');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white">
      <main className="flex flex-col gap-6 items-center p-8 bg-neutral-900 rounded-lg shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Prihlásenie</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {error && <div className="text-red-500 text-sm p-2 bg-red-500/10 rounded">{error}</div>}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2 bg-neutral-800 rounded border border-neutral-700 outline-none focus:border-neutral-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Heslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-2 bg-neutral-800 rounded border border-neutral-700 outline-none focus:border-neutral-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 p-2 bg-white text-black font-semibold rounded hover:bg-neutral-200 transition disabled:opacity-50"
          >
            {isLoading ? 'Prihlasujem...' : 'Prihlásiť sa'}
          </button>
        </form>
        <p className="text-sm text-neutral-400">
          Nemáte účet? <a href="/register" className="text-white hover:underline">Zaregistrovať sa</a>
        </p>
      </main>
    </div>
  );
}
