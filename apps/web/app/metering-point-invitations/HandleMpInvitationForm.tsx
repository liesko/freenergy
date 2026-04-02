'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';

export default function HandleMpInvitationForm({ invitationId }: { invitationId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: 'accept' | 'reject') => {
    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    try {
      const res = await fetch(`${API_URL}/metering-point-invitations/${invitationId}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        alert(`Úspešne spracované!`);
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => null);
        alert(`Spracovanie pozvánky zlyhalo: ${errorData?.message || 'Neznáma chyba'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Vyskytla sa sieťová chyba.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex gap-2 z-10">
      <Button 
        variant="primary"
        onClick={() => handleAction('accept')} 
        disabled={isLoading}
        className="px-4 py-1.5"
      >
        Prijať
      </Button>
      <Button 
        variant="danger"
        onClick={() => handleAction('reject')} 
        disabled={isLoading}
        className="px-4 py-1.5"
      >
        Zamietnuť
      </Button>
    </div>
  );
}
