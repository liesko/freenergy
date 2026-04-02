'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';

export default function CancelRequestButton({ requestId }: { requestId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm('Naozaj chcete zrušiť túto žiadosť o pripojenie?')) return;
    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    try {
      const res = await fetch(`${API_URL}/join-requests/${requestId}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Nepodarilo sa zrušiť žiadosť o pripojenie.');
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <Button
      variant="outline"
      onClick={handleCancel}
      disabled={isLoading}
      className="text-xs font-bold w-full mt-2 px-3 py-1.5 h-auto text-amber-700 hover:text-amber-800 border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 shadow-sm"
    >
      {isLoading ? 'Spracúvam...' : 'Zrušiť žiadosť'}
    </Button>
  );
}
