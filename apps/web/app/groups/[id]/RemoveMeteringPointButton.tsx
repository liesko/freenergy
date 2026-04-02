'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RemoveMeteringPointButton({ groupId, pointId }: { groupId: string; pointId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    if (!confirm('Naozaj chcete odstrániť toto pripojené miesto zo skupiny?')) return;
    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/remove-metering-point`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ meteringPointId: pointId })
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Nepodarilo sa odstrániť pripojené miesto.');
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleRemove}
      disabled={isLoading}
      className="text-xs bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:text-red-800 font-bold px-3 py-1.5 rounded-md shadow-sm transition-colors"
    >
      {isLoading ? '...' : 'Odstrániť'}
    </button>
  );
}
