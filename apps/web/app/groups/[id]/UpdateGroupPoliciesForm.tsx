'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UpdateGroupPoliciesFormProps {
  groupId: string;
  initialPolicies: {
    isActive: boolean;
    acceptsJoinRequests: boolean;
    acceptsInvitations: boolean;
    acceptedMeteringPointTypes: 'BOTH' | 'PRODUCTION_ONLY' | 'CONSUMPTION_ONLY';
  };
}

export default function UpdateGroupPoliciesForm({ groupId, initialPolicies }: UpdateGroupPoliciesFormProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(initialPolicies.isActive);
  const [acceptsJoinRequests, setAcceptsJoinRequests] = useState(initialPolicies.acceptsJoinRequests);
  const [acceptsInvitations, setAcceptsInvitations] = useState(initialPolicies.acceptsInvitations);
  const [acceptedTypes, setAcceptedTypes] = useState(initialPolicies.acceptedMeteringPointTypes);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/groups/${groupId}/policies`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isActive,
          acceptsJoinRequests,
          acceptsInvitations,
          acceptedMeteringPointTypes: acceptedTypes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Aktualizácia politík zlyhala');
      }

      setSuccess(true);
      router.refresh();
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Vyskytla sa chyba');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm mt-4">
      <h2 className="text-xl font-bold mb-3 text-slate-900">Prevádzkové politiky skupiny</h2>
      <p className="text-sm text-slate-500 mb-6">Spravujte, ako táto skupina narába so zariadeniami a žiadosťami o pripojenie.</p>

      {error && <div className="text-red-700 text-sm p-3 bg-red-50 border border-red-200 rounded-lg mb-4">{error}</div>}
      {success && <div className="text-emerald-700 text-sm p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">Politiky boli úspešne aktualizované.</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Is Active Toggle */}
        <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-800">Skupina je aktívna</span>
            <span className="text-xs text-slate-500 w-4/5">Povoľte alebo zakážte všetky hlavné operácie v tejto skupine.</span>
          </div>
          <input 
            type="checkbox" 
            checked={isActive} 
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
          />
        </label>

        {/* Join Requests Toggle */}
        <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-800">Prijať žiadosti o pripojenie</span>
            <span className="text-xs text-slate-500 w-4/5">Umožnite používateľom objaviť a požiadať o pripojenie ich zariadení.</span>
          </div>
          <input 
            type="checkbox" 
            checked={acceptsJoinRequests} 
            onChange={(e) => setAcceptsJoinRequests(e.target.checked)}
            className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
          />
        </label>

        {/* Invitations Toggle */}
        <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-800">Pozvánky pre zariadenia povolené</span>
            <span className="text-xs text-slate-500 w-4/5">Umožnite vlastníkom aktívne pozývať voľné EIC.</span>
          </div>
          <input 
            type="checkbox" 
            checked={acceptsInvitations} 
            onChange={(e) => setAcceptsInvitations(e.target.checked)}
            className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
          />
        </label>

        {/* Accepted Type Selector */}
        <div className="flex flex-col gap-2 p-4 border border-slate-200 rounded-xl shadow-sm bg-white">
          <span className="font-bold text-slate-800">Akceptované typy zariadení</span>
          <span className="text-xs text-slate-500 mb-2">Obmedzte prijímanie na špecifické typy zariadení. Neovplyvní to už priradené zariadenia.</span>
          <select 
            value={acceptedTypes} 
            onChange={(e) => setAcceptedTypes(e.target.value as any)}
            className="p-2.5 bg-white border border-slate-300 text-sm rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 transition-all font-medium hover:border-slate-400 cursor-pointer"
          >
            <option value="BOTH">OBE (Výrobné aj Odberné)</option>
            <option value="PRODUCTION_ONLY">IBA VÝROBNÉ</option>
            <option value="CONSUMPTION_ONLY">IBA ODBERNÉ</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-4 self-start px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {isLoading ? 'Ukladám...' : 'Uložiť politiky'}
        </button>

      </form>
    </div>
  );
}
