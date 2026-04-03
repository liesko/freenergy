'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateMeteringPointForm() {
  const router = useRouter();
  const [eic, setEic] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'CONSUMPTION' | 'PRODUCTION'>('CONSUMPTION');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/metering-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ eic, type, ...(name && { name }) }),
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

      setEic('');
      setName('');
      setType('CONSUMPTION');
      router.push('/metering-points');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Počas vytvárania sa vyskytla chyba');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-slate-200 p-6 rounded-xl bg-white shadow-sm w-full mb-4">
      <h3 className="text-xl font-bold text-slate-900">Zaregistrovať pripojené miesto</h3>
      {error && <div className="text-red-700 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
      
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">EIC kód <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={eic}
          onChange={(e) => setEic(e.target.value.toUpperCase())}
          required
          maxLength={16}
          placeholder="napr. 24Z..."
          className="p-3 bg-slate-50 rounded-lg border border-slate-300 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 font-mono uppercase placeholder:text-slate-400"
        />
        <p className="text-xs text-slate-500">16-miestny alfanumerický kód identifikujúci vaše fyzické pripojenie.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Typ <span className="text-red-500">*</span></label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="p-3 bg-slate-50 rounded-lg border border-slate-300 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900"
        >
          <option value="CONSUMPTION">Odberné miesto</option>
          <option value="PRODUCTION">Výrobné miesto</option>
        </select>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Názov (Voliteľné)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="napr. Rodinný dom, FVE na streche"
          className="p-3 bg-slate-50 rounded-lg border border-slate-300 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !eic}
        className="mt-3 p-3 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Registrujem...' : 'Zaregistrovať zariadenie'}
      </button>
    </form>
  );
}
