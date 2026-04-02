import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import RequestJoinGroupForm from './RequestJoinGroupForm';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';

async function fetchMe(token: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchDiscoverableGroups(token: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/groups/discoverable`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchMyPoints(token: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/metering-points`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DiscoverGroupsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const me = await fetchMe(token);
  const groups = await fetchDiscoverableGroups(token);
  const allPoints = await fetchMyPoints(token);

  const availablePoints = allPoints?.filter((p: any) => !p.groupId && (!p.joinRequests || p.joinRequests.length === 0)) || [];

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex flex-col items-center">
      <main className="w-full max-w-4xl flex flex-col gap-6 font-[family-name:var(--font-geist-sans)]">
        <SectionHeader 
          title="Preskúmať energetické siete"
          description="Prehliadajte verejné skupiny, ktoré aktuálne prijímajú nové zariadenia. Priraďte svoje dostupné pripojené miesta, aby ste sa k nim bezpečne pripojili."
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"></path></svg>}
          action={
            <Button as={Link} href="/groups" variant="outline" className="text-white">
              Moje skupiny
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {groups && groups.length > 0 ? groups.map((group: any) => (
            <Card key={group.id} className="flex flex-col gap-4 border-l-4 border-l-teal-500 hover:-translate-y-1 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{group.name}</h2>
                  <p className="text-slate-600 mt-2 text-sm leading-relaxed">{group.description || <span className="italic opacity-50">Popis nebol poskytnutý</span>}</p>
                </div>
              </div>
              <div className="font-mono text-[10px] text-slate-400 border-b border-slate-100 pb-2">NET-ID: {group.id}</div>
              <div className="mt-2">
                <RequestJoinGroupForm groupId={group.id} availablePoints={availablePoints} />
              </div>
            </Card>
          )) : (
            <Card className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 mb-4 text-slate-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Zatiaľ žiadne verejné siete</h3>
              <p className="max-w-sm text-sm">Momentálne neexistujú žiadne verejne objaviteľné skupiny prijímajúce žiadosti. Skúste to neskôr alebo si vytvorte vlastnú skupinu!</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
