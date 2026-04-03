'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TopUpForm() {
  const [amount, setAmount] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/users/me/budget/top-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full max-w-md">
      <h3 className="font-bold text-lg text-slate-900 mb-2">Dobitie kreditu (Rýchla platba)</h3>
      <p className="text-sm text-slate-500 mb-6">Použite testovaciu platobnú bránu na navýšenie rozpočtu</p>
      
      <form onSubmit={handleTopUp} className="flex flex-col gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="0000 0000 0000 0000" 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed focus:outline-none"
            disabled
            value="**** **** **** 4242"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Suma (EUR)</span>
            <input 
              type="number" 
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" 
            />
          </label>
          <button 
            type="submit" 
            disabled={isProcessing}
            className="mt-5 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-sm shadow-emerald-600/20 transition disabled:opacity-75 disabled:cursor-wait"
          >
            {isProcessing ? 'Spracovanie...' : 'Zaplatiť'}
          </button>
        </div>

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm flex items-center gap-2 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Platba uspešná!
          </div>
        )}
      </form>
    </div>
  );
}
