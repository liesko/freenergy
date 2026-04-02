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
      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200">
        <h3 className="font-bold text-slate-800">Požiadať so zariadením</h3>
        <div className="text-slate-500 text-sm italic">Nemáte k dispozícii žiadne nepriradené pripojené miesta. Najprv si nejaké vytvorte alebo odpojte existujúce.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 pt-4 border-t border-slate-200">
      <h3 className="font-bold text-slate-800 mb-1">Požiadať so zariadením</h3>
      {error && <div className="text-red-700 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
      {success && <div className="text-emerald-700 text-sm p-3 bg-emerald-50 border border-emerald-200 rounded-lg">{success}</div>}
      
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Vyberte zariadenie <span className="text-red-500">*</span></label>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <select
            value={selectedPointId}
            onChange={(e) => setSelectedPointId(e.target.value)}
            required
            className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-300 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 disabled:opacity-50"
            disabled={isLoading}
          >
            <option value="" disabled>-- Vyberte nepriradené miesto --</option>
            {availablePoints.map(p => (
              <option key={p.id} value={p.id}>
                {p.eic} ({p.type}) {p.name ? `- ${p.name}` : ''}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={isLoading || !selectedPointId}
            className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 shrink-0"
          >
            {isLoading ? 'Odosielam žiadosť...' : 'Odoslať žiadosť o pripojenie'}
          </button>
        </div>
      </div>
    </form>
  );
}
