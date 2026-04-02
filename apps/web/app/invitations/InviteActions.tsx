'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InviteActions({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (action: 'accept' | 'reject') => {
    setIsLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/invitations/${invitationId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || `Akcia zlyhala`);
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Vyskytla sa chyba');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
      {error && <div className="text-red-700 text-xs p-2 bg-red-50 border border-red-200 rounded-md">{error}</div>}
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          onClick={() => handleAction('accept')}
          disabled={isLoading}
          className="flex-1 sm:flex-none px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 transition"
        >
          {isLoading ? '...' : 'Prijať'}
        </button>
        <button
          onClick={() => handleAction('reject')}
          disabled={isLoading}
          className="flex-1 sm:flex-none px-6 py-2 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 transition"
        >
          {isLoading ? '...' : 'Zamietnuť'}
        </button>
      </div>
    </div>
  );
}
