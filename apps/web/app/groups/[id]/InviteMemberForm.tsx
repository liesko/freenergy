'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InviteMemberForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/groups/${groupId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server vrátil neočakávanú odpoveď.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Pozvanie zlyhalo'
        );
      }

      setEmail('');
      setSuccess('Pozvánka bola úspešne odoslaná!');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Počas pozývania sa vyskytla chyba');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-slate-200 p-6 rounded-xl bg-white shadow-sm w-full mt-4">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Pozvať do skupiny</h3>
        <p className="text-sm text-slate-500 mt-1">Pošlite pozvánku existujúcemu registrovanému používateľovi, aby sa pridal do tejto skupiny.</p>
      </div>

      {error && <div className="text-red-700 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
      {success && <div className="text-emerald-700 text-sm p-3 bg-emerald-50 border border-emerald-200 rounded-lg">{success}</div>}
      
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Email používateľa <span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="user@example.com"
            className="p-3 flex-grow bg-slate-50 rounded-lg border border-slate-300 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isLoading || !email}
            className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Pozývam...' : 'Pozvať'}
          </button>
        </div>
      </div>
    </form>
  );
}
