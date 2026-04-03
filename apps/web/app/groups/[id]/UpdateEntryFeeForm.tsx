'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UpdateEntryFeeForm({ groupId, initialFee }: { groupId: string; initialFee: number }) {
  const router = useRouter();
  const [fee, setFee] = useState(initialFee);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/groups/${groupId}/entry-fee`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ entryFee: Number(fee) }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Zmena poplatku zlyhala');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Vyskytla sa chyba');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/50 shadow-sm mt-4 flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Administrátorský prístup
        </h3>
        <p className="text-xs text-indigo-700">Môžete kedykoľvek zmeniť ročný vstupný platobný poplatok tejto skupiny.</p>
      </div>

      <div className="flex gap-2 items-center">
        <input 
          type="number"
          min="0"
          step="0.5"
          value={fee}
          onChange={(e) => setFee(Number(e.target.value))}
          className="p-2 border border-indigo-300 rounded-md w-28 outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-indigo-900 bg-white"
        />
        <span className="font-bold text-slate-600 border border-slate-200 bg-slate-100 p-2 rounded-md">EUR / rok</span>
      </div>

      {error && <span className="text-xs text-red-600 font-bold bg-red-100 p-1.5 rounded">{error}</span>}
      {success && <span className="text-xs text-emerald-600 font-bold bg-emerald-100 p-1.5 rounded">Poplatok bol úspešne uložený.</span>}

      <button 
        type="submit" 
        disabled={isLoading}
        className="self-start mt-2 px-4 py-1.5 bg-indigo-600 text-white font-bold text-sm rounded shadow hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLoading ? 'Ukladám...' : 'Zmeniť poplatok'}
      </button>
    </form>
  );
}
