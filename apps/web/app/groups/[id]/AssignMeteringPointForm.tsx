'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AssignMeteringPointForm({ groupId, availablePoints }: { groupId: string, availablePoints: any[] }) {
  const router = useRouter();
  const [selectedPointId, setSelectedPointId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPointId) return;
    
    setIsLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/groups/${groupId}/metering-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ meteringPointId: selectedPointId }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an unexpected response.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Assignment failed'
        );
      }

      setSelectedPointId('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during assignment');
    } finally {
      setIsLoading(false);
    }
  };

  if (!availablePoints || availablePoints.length === 0) {
    return (
      <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm flex flex-col gap-4 mt-6">
        <h2 className="text-xl font-bold text-slate-800">Assign Metering Point</h2>
        <div className="text-slate-500 text-sm">You have no available metering points to assign.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col gap-4 shadow-sm mt-6">
      <h2 className="text-xl font-bold text-slate-800">Assign Metering Point</h2>
      {error && <div className="text-red-700 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
      
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Select Asset <span className="text-red-500">*</span></label>
        <select
          value={selectedPointId}
          onChange={(e) => setSelectedPointId(e.target.value)}
          required
          className="p-3 bg-slate-50 rounded-lg border border-slate-300 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900"
        >
          <option value="" disabled>-- Select an unassigned Point --</option>
          {availablePoints.map(p => (
            <option key={p.id} value={p.id}>
              {p.eic} ({p.type}) {p.name ? `- ${p.name}` : ''}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading || !selectedPointId}
        className="self-start px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Assigning...' : 'Assign Asset'}
      </button>
    </form>
  );
}
