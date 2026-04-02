'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InviteMeteringPointForm({ groupId }: { groupId: string }) {
  const [eic, setEic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eic.trim()) return;

    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/metering-point-invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eic: eic.trim() }),
      });

      if (res.ok) {
        alert('Pozvánka bola úspešne odoslaná!');
        setEic('');
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => null);
        alert(`Nepodarilo sa odoslať pozvánku: ${errorData?.message || 'Neznáma chyba'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Vyskytla sa sieťová chyba.');
    }
    setIsLoading(false);
  };

  return (
    <div className="border border-slate-200 p-6 rounded-xl bg-white shadow-sm flex flex-col gap-4 mt-6">
      <h2 className="text-xl font-bold text-slate-900">Pozvať zariadenie podľa EIC</h2>
      <p className="text-sm text-slate-500">
        Zadajte presné EIC aktuálne dostupného zariadenia pre odoslanie oficiálnej pozvánky jeho vlastníkovi.
      </p>
      <form onSubmit={handleInvite} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
          EIC kód
          <input
            type="text"
            value={eic}
            onChange={e => setEic(e.target.value)}
            placeholder="Napr. 24Z1234567890ABC"
            className="p-2.5 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-sm text-slate-900 transition-all placeholder:text-slate-400"
            required
          />
        </label>
        <button
          type="submit"
          disabled={isLoading || !eic.trim()}
          className="self-start mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Odosielam...' : 'Odoslať pozvánku'}
        </button>
      </form>
    </div>
  );
}
