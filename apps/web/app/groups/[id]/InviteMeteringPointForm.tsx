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
    <div className="border border-neutral-800 p-6 rounded-lg bg-neutral-900 flex flex-col gap-4 mt-6">
      <h2 className="text-xl font-semibold">Pozvať zariadenie podľa EIC</h2>
      <p className="text-sm text-neutral-400">
        Zadajte presné EIC aktuálne dostupného zariadenia pre odoslanie oficiálnej pozvánky jeho vlastníkovi.
      </p>
      <form onSubmit={handleInvite} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-300">
          EIC kód
          <input
            type="text"
            value={eic}
            onChange={e => setEic(e.target.value)}
            placeholder="e.g. 24Z1234567890ABC"
            className="p-2 rounded bg-neutral-950 border border-neutral-700 focus:outline-none focus:border-emerald-500 font-mono text-sm"
            required
          />
        </label>
        <button
          type="submit"
          disabled={isLoading || !eic.trim()}
          className="self-start mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Odosielam...' : 'Odoslať pozvánku'}
        </button>
      </form>
    </div>
  );
}
