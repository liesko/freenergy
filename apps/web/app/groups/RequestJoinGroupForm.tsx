'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RequestJoinGroupForm({ groupId, availablePoints }: { groupId: string, availablePoints: any[] }) {
  const router = useRouter();
  const [selectedPointId, setSelectedPointId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPointId) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/groups/${groupId}/join-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ meteringPointId: selectedPointId }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server vrátil neočakávanú odpoveď.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Žiadosť zlyhala'
        );
      }

      setSelectedPointId('');
      setSuccess('Žiadosť o pripojenie bola úspešne odoslaná. Čaká sa na schválenie vlastníkom.');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Počas vytvárania žiadosti sa vyskytla chyba');
    } finally {
      setIsLoading(false);
    }
  };

  if (!availablePoints || availablePoints.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="text-slate-500 text-[11px] italic">Nemáte k dispozícii žiadne nepriradené pripojené miesta.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && <div className="text-red-700 text-xs p-2 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
      {success && <div className="text-emerald-700 text-xs p-2 bg-emerald-50 border border-emerald-200 rounded-lg">{success}</div>}
      
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-600">Požiadať s dostupným zariadením <span className="text-red-500">*</span></label>
        <div className="flex flex-col gap-2">
          <select
            value={selectedPointId}
            onChange={(e) => setSelectedPointId(e.target.value)}
            required
            className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 text-sm disabled:opacity-50"
            disabled={isLoading}
          >
            <option value="" disabled>-- Vyberte miesto --</option>
            {availablePoints.map(p => (
              <option key={p.id} value={p.id}>
                {p.eic} ({p.type}) {p.name ? `- ${p.name}` : ''}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={isLoading || !selectedPointId}
            className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Odosielam...' : 'Odoslať žiadosť'}
          </button>
        </div>
      </div>
    </form>
  );
}
