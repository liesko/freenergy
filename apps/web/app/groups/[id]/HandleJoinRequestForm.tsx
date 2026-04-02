'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HandleJoinRequestForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: 'approve' | 'reject') => {
    setIsLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/join-requests/${requestId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server vrátil neočakávanú odpoveď.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(', ') : data.message || `Akcia zlyhala`
        );
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || `Vyskytla sa chyba`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-end">
      {error && <div className="text-red-700 text-xs p-2 bg-red-50 border border-red-200 rounded-md">{error}</div>}
      <div className="flex gap-2">
        <button
          onClick={() => handleAction('approve')}
          disabled={isLoading}
          className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 text-sm"
        >
          {isLoading ? '...' : 'Schváliť'}
        </button>
        <button
          onClick={() => handleAction('reject')}
          disabled={isLoading}
          className="px-4 py-1.5 bg-white text-slate-700 border border-slate-300 font-bold rounded-lg shadow-sm hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition disabled:opacity-50 text-sm"
        >
          {isLoading ? '...' : 'Zamietnuť'}
        </button>
      </div>
    </div>
  );
}
