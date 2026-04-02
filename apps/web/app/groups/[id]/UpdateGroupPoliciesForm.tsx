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
    <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-900 mt-4">
      <h2 className="text-xl font-semibold mb-4 text-white">Prevádzkové politiky skupiny</h2>
      <p className="text-sm text-neutral-400 mb-6">Spravujte, ako táto skupina narába so zariadeniami a žiadosťami o pripojenie.</p>

      {error && <div className="text-red-500 text-sm p-3 bg-red-900/20 border border-red-800 rounded mb-4">{error}</div>}
      {success && <div className="text-emerald-400 text-sm p-3 bg-emerald-900/20 border border-emerald-800 rounded mb-4">Politiky boli úspešne aktualizované.</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Is Active Toggle */}
        <label className="flex items-center justify-between p-3 border border-neutral-800 rounded hover:bg-neutral-800/50 cursor-pointer transition">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-neutral-200">Skupina je aktívna</span>
            <span className="text-xs text-neutral-500">Povoľte alebo zakážte všetky hlavné operácie v tejto skupine.</span>
          </div>
          <input 
            type="checkbox" 
            checked={isActive} 
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 accent-emerald-500 cursor-pointer"
          />
        </label>

        {/* Join Requests Toggle */}
        <label className="flex items-center justify-between p-3 border border-neutral-800 rounded hover:bg-neutral-800/50 cursor-pointer transition">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-neutral-200">Prijať žiadosti o pripojenie</span>
            <span className="text-xs text-neutral-500">Umožnite používateľom objaviť a požiadať o pripojenie ich zariadení.</span>
          </div>
          <input 
            type="checkbox" 
            checked={acceptsJoinRequests} 
            onChange={(e) => setAcceptsJoinRequests(e.target.checked)}
            className="w-5 h-5 accent-emerald-500 cursor-pointer"
          />
        </label>

        {/* Invitations Toggle */}
        <label className="flex items-center justify-between p-3 border border-neutral-800 rounded hover:bg-neutral-800/50 cursor-pointer transition">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-neutral-200">Pozvánky pre zariadenia povolené</span>
            <span className="text-xs text-neutral-500">Umožnite vlastníkom aktívne pozývať voľné EIC.</span>
          </div>
          <input 
            type="checkbox" 
            checked={acceptsInvitations} 
            onChange={(e) => setAcceptsInvitations(e.target.checked)}
            className="w-5 h-5 accent-emerald-500 cursor-pointer"
          />
        </label>

        {/* Accepted Type Selector */}
        <div className="flex flex-col gap-2 p-3 border border-neutral-800 rounded">
          <span className="font-semibold text-neutral-200">Akceptované typy zariadení</span>
          <span className="text-xs text-neutral-500 mb-2">Obmedzte prijímanie na špecifické typy zariadení. Neovplyvní to už priradené zariadenia.</span>
          <select 
            value={acceptedTypes} 
            onChange={(e) => setAcceptedTypes(e.target.value as any)}
            className="p-2 bg-black border border-neutral-700 text-sm rounded outline-none focus:border-neutral-500 text-white"
          >
            <option value="BOTH">OBE (Výrobné aj Odberné)</option>
            <option value="PRODUCTION_ONLY">IBA VÝROBNÉ</option>
            <option value="CONSUMPTION_ONLY">IBA ODBERNÉ</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-2 self-start px-6 py-2 bg-white text-black font-semibold rounded hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {isLoading ? 'Ukladám...' : 'Uložiť politiky'}
        </button>

      </form>
    </div>
  );
}
