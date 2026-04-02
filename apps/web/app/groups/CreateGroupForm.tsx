'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, ...(description && { description }) }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server vrátil neočakávanú odpoveď.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Vytvorenie zlyhalo'
        );
      }

      setName('');
      setDescription('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Počas vytvárania sa vyskytla chyba');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-slate-200 p-6 rounded-xl bg-white shadow-sm w-full mb-8">
      <h3 className="text-xl font-bold text-slate-900">Vytvoriť novú skupinu</h3>
      {error && <div className="text-red-700 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
      
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Názov <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={3}
          className="p-3 bg-slate-50 rounded-lg border border-slate-300 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900"
        />
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Popis</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-3 bg-slate-50 rounded-lg border border-slate-300 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900"
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading || name.length < 3}
        className="mt-3 p-3 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Vytváram...' : 'Vytvoriť skupinu'}
      </button>
    </form>
  );
}
