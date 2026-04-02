'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';

export default function LeaveGroupButton({ pointId }: { pointId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLeave = async () => {
    if (!confirm('Naozaj chcete, aby toto pripojené miesto opustilo svoju priradenú skupinu?')) return;
    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    try {
      const res = await fetch(`${API_URL}/metering-points/${pointId}/leave-group`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Nepodarilo sa opustiť skupinu.');
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <Button
      variant="danger"
      onClick={handleLeave}
      disabled={isLoading}
      className="text-xs font-bold w-full mt-2 px-3 py-1.5 h-auto"
    >
      {isLoading ? 'Spracúvam...' : 'Opustiť skupinu'}
    </Button>
  );
}
