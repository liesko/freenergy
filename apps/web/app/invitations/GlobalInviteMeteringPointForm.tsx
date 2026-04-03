'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalInviteMeteringPointForm({ groups }: { groups: any[] }) {
  const [eic, setEic] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(groups.length > 0 ? groups[0].id : '');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (groups.length === 0) {
    return null;
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eic.trim() || !selectedGroupId) return;

    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const res = await fetch(`${API_URL}/groups/${selectedGroupId}/metering-point-invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eic: eic.trim() }),
      });

      if (res.ok) {
        alert('Pozvánka bola úspešne odoslaná zariadeniu so zadaným EIC!');
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
    <div className="border border-slate-200 p-6 rounded-xl bg-white shadow-sm flex flex-col gap-4 mt-2 mb-6">
      <h2 className="text-xl font-bold text-slate-900">Pozvať zariadenie do skupiny</h2>
      <p className="text-sm text-slate-500">
        Zadajte presné EIC aktuálne dostupného zariadenia pre odoslanie oficiálnej pozvánky jeho vlastníkovi do vybranej spravovanej skupiny.
      </p>
      <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-end gap-3 w-full">
        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700 w-full sm:w-auto flex-1">
          Vybrať skupinu
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="p-2.5 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-900 transition-all font-medium"
            required
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </label>
        
        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700 w-full sm:w-auto flex-1">
          EIC kód zariadenia
          <input
            type="text"
            value={eic}
            onChange={e => setEic(e.target.value.toUpperCase())}
            placeholder="Napr. 24Z1234567890ABC"
            className="p-2.5 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-sm text-slate-900 transition-all placeholder:text-slate-400"
            required
            maxLength={16}
          />
        </label>
        
        <button
          type="submit"
          disabled={isLoading || !eic.trim() || !selectedGroupId}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Odosielam...' : 'Odoslať pozvánku'}
        </button>
      </form>
    </div>
  );
}
