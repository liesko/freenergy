import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import HandleMpInvitationForm from './HandleMpInvitationForm';
import Link from 'next/link';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';

async function fetchInvitations(token: string) {
  const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${API_URL}/metering-point-invitations`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 401) return { error: 'Unauthorized' };
      return [];
    }
    return res.json();
  } catch (err) {
    return [];
  }
}

export default async function MeteringPointInvitationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const invitations = await fetchInvitations(token);

  if ('error' in invitations) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex flex-col items-center">
      <main className="w-full max-w-2xl flex flex-col gap-6 font-[family-name:var(--font-geist-sans)]">
        <SectionHeader 
          title="Doručené pozvánky" 
          description="Spravujte žiadosti od skupín, ktoré pozývajú vaše zariadenia."
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>}
          action={
            <Button as={Link} href="/metering-points" variant="outline">
              Späť na zariadenia
            </Button>
          }
        />

        <div className="flex flex-col gap-4">
          {!invitations || invitations.length === 0 ? (
             <Card className="text-center py-10 shadow-sm">
               <div className="text-slate-500 text-sm italic">Pre vaše pripojené miesta nemáte žiadne čakajúce pozvánky.</div>
             </Card>
          ) : (
            invitations.map((inv: any) => (
               <Card key={inv.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden gap-4 p-5 hover:shadow-md transition">
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500" />
                 <div className="flex flex-col gap-1 pl-2">
                   <div className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                     {inv.meteringPoint.eic}
                     <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase border bg-teal-50 text-teal-700 border-teal-200 tracking-widest">
                       POZVANÉ
                     </span>
                   </div>
                   {inv.meteringPoint.name && <div className="text-sm text-slate-600 font-mono mt-0.5">{inv.meteringPoint.name} ({inv.meteringPoint.type})</div>}
                   <div className="text-sm text-slate-700 mt-2">
                     Pozvané do skupiny: <span className="font-bold text-emerald-700">{inv.group.name}</span>
                   </div>
                   <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Pozvané dňa {new Date(inv.createdAt).toLocaleString()}</div>
                 </div>
                 <HandleMpInvitationForm invitationId={inv.id} />
               </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
