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

async function fetchDiscoverableGroups(token: string, query?: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    let url = `${API_URL}/groups/discoverable`;
    if (query) {
      url += `?q=${encodeURIComponent(query)}`;
    }
    const res = await fetch(url, {
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

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DiscoverGroupsPage(props: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  // Handle both Next.js 14 and 15 by awaiting searchParams if it's a promise
  const resolvedParams = await (async () => {
    try {
      return props.searchParams ? await props.searchParams : {};
    } catch {
      return props.searchParams || {};
    }
  })();
  const q = resolvedParams?.q as string | undefined;

  const me = await fetchMe(token);
  const groups = await fetchDiscoverableGroups(token, q);
  const allPoints = await fetchMyPoints(token);

  const availablePoints = allPoints?.filter((p: any) => !p.groupId && (!p.joinRequests || p.joinRequests.length === 0)) || [];

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex flex-col items-center">
      <main className="w-full max-w-2xl flex flex-col gap-6 font-[family-name:var(--font-geist-sans)]">
        <SectionHeader 
          title="Prehľad Verejných skupín"
          description="Prehliadajte verejné skupiny, ktoré aktuálne prijímajú nové zariadenia. Priraďte svoje dostupné pripojené miesta, aby ste sa k nim bezpečne pripojili."
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"></path></svg>}
          action={
            <Button as={Link} href="/groups" variant="outline" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm">
              Moje skupiny
            </Button>
          }
        />

        <form action="/groups/discover" method="GET" className="flex gap-2">
          <input 
            type="text" 
            name="q" 
            defaultValue={q || ''} 
            placeholder="Hľadať podľa názvu skupiny..." 
            className="flex-1 p-2.5 rounded-lg bg-white shadow-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-900 transition-all font-medium placeholder:text-slate-400 focus:placeholder:text-slate-300"
          />
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6">Vyhľadať</Button>
        </form>

        <div className="flex flex-col gap-4 mt-2">
          {groups && groups.length > 0 ? groups.map((group: any) => (
            <Card key={group.id} className="!p-5 border-l-4 border-l-teal-500 hover:-translate-y-1 transition">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 md:gap-8">
                
                {/* Ľavý stĺpec: Názov, popis a ID */}
                <div className="flex-1 flex flex-col min-w-0">
                  <h2 className="text-lg font-bold text-slate-900">{group.name}</h2>
                  <p className="text-slate-600 mt-1.5 text-[13px] leading-relaxed">
                    {group.description || <span className="italic opacity-50">Popis nebol poskytnutý</span>}
                  </p>
                  <div className="font-mono text-[9px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    NET-ID: {group.id}
                  </div>
                </div>

                {/* Pravý stĺpec: Formulár / Tlačidlo */}
                <div className="w-full md:w-[280px] shrink-0 border-t border-slate-100 pt-4 md:border-t-0 md:pt-0">
                  <RequestJoinGroupForm groupId={group.id} availablePoints={availablePoints} />
                </div>
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
