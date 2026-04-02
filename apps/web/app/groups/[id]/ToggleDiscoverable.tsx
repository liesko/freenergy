'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ToggleDiscoverable({ groupId, initial }: { groupId: string; initial: boolean }) {
  const [isDiscoverable, setIsDiscoverable] = useState(initial);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/discoverable`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isDiscoverable: !isDiscoverable })
      });
      if (res.ok) {
        setIsDiscoverable(!isDiscoverable);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={`px-3 py-1.5 text-[10px] tracking-wider font-extrabold uppercase rounded-md border shadow-sm transition-colors ${
        isDiscoverable 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800'
          : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200 hover:text-slate-700'
      }`}
    >
      {isLoading ? 'Čakajte...' : isDiscoverable ? 'VEREJNÁ (OBJAVITEĽNÁ)' : 'SÚKROMNÁ'}
    </button>
  );
}
