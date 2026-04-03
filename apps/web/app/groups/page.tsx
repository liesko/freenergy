import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CreateGroupForm from './CreateGroupForm';
import Link from 'next/link';
import RequestJoinGroupForm from './RequestJoinGroupForm';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

async function fetchGroups(token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/groups`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchUser(token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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

export default async function GroupsPage(props: { searchParams: Promise<{ view?: string; q?: string }> }) {
  const searchParams = await props.searchParams;
  const view = searchParams.view || 'all';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const user = await fetchUser(token);
  if (!user) {
    return (
      <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex flex-col items-center">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">Nepodarilo sa načítať stav. Skontrolujte svoje pripojenie.</div>
        <Link href="/" className="mt-4 text-emerald-600 font-medium hover:text-emerald-700 hover:underline transition">Návrat domov</Link>
      </div>
    );
  }

  let groups = [];
  let availablePoints = [];

  if (view === 'public') {
    groups = await fetchDiscoverableGroups(token, searchParams.q);
    const allPoints = await fetchMyPoints(token);
    availablePoints = allPoints?.filter((p: any) => !p.groupId && (!p.joinRequests || p.joinRequests.length === 0)) || [];
  } else if (view !== 'create') {
    groups = await fetchGroups(token);
  }

  const ownedGroups = (view !== 'public' && view !== 'create') ? groups.filter((g: any) => g.ownerId === user.id) : [];
  const displayGroups = view === 'owned' ? ownedGroups : groups;

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex flex-col items-center">
      <main className="w-full max-w-4xl flex flex-col gap-6">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 mb-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Skupiny</h1>
          
          {/* Navigácia záložiek (Tlačidlá) */}
          <div className="flex flex-wrap gap-4 items-center">
            <Link 
              href="/groups" 
              className={`text-sm font-semibold border shadow-sm transition px-5 py-2.5 rounded-lg ${view === 'all' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            >
              Referenčné skupiny
            </Link>
            
            <Link 
              href="/groups?view=owned" 
              className={`text-sm font-semibold border shadow-sm transition px-5 py-2.5 rounded-lg ${view === 'owned' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            >
              Moje skupiny
            </Link>

            <Link 
              href="/groups?view=public" 
              className={`text-sm font-semibold border shadow-sm transition px-5 py-2.5 rounded-lg ${view === 'public' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            >
              Verejné skupiny
            </Link>

            <Link 
              href="/groups?view=create" 
              className={`text-sm font-semibold border shadow-sm transition px-5 py-2.5 rounded-lg ${view === 'create' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'}`}
            >
              + Pridaj skupinu
            </Link>
          </div>
        </div>

        {view === 'create' && (
          <div className="max-w-2xl mt-4">
            <CreateGroupForm />
          </div>
        )}

        {(view === 'all' || view === 'owned') && (
          <div className="flex flex-col gap-4 mt-2">
            <h2 className="text-xl font-bold text-slate-800">
              {view === 'owned' ? 'Skupiny, ktoré spravujete' : 'Všetky skupiny, ktorých ste súčasťou'}
            </h2>
            {displayGroups.length === 0 ? (
              <p className="text-slate-500 italic p-6 bg-slate-100 rounded-xl border border-slate-200">
                {view === 'owned' 
                  ? 'Zatiaľ nespravujete žiadne vlastné skupiny. Založte si novú komunitu!' 
                  : 'Nenachádzate sa v žiadnej skupine. Požiadajte o vstup cez zoznam Verejných skupín alebo si založte vlastnú.'}
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {displayGroups.map((group: any) => (
                  <Link href={`/groups/${group.id}`} key={group.id} className="block border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition shadow-sm rounded-xl p-5 relative overflow-hidden flex flex-col h-full">
                    <h3 className="text-lg font-bold text-slate-900 pr-12">{group.name}</h3>
                    {group.ownerId === user.id && (
                      <span className="absolute top-5 right-5 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Owner</span>
                    )}
                    {group.description && <p className="text-slate-600 text-sm mt-2 line-clamp-2">{group.description}</p>}
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mt-auto pt-4">Vytvorené: {new Date(group.createdAt).toLocaleDateString()}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'public' && (
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1 mb-4">
              <h2 className="text-xl font-bold text-slate-800">Prehľad verejných skupín</h2>
              <p className="text-slate-500 text-sm">
                Prehliadajte verejné skupiny. Priraďte svoje dostupné EIC miesta, aby ste sa k nim pridali.
              </p>
            </div>

            <form action="/groups" method="GET" className="flex gap-2 w-full max-w-sm mb-2">
              <input type="hidden" name="view" value="public" />
              <input 
                type="text" 
                name="q" 
                defaultValue={searchParams.q || ''} 
                placeholder="Hľadať podľa názvu..." 
                className="flex-1 p-2 rounded-lg bg-white shadow-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-900 transition-all font-medium placeholder:text-slate-400"
              />
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4">Hľadať</Button>
            </form>

            <div className="flex flex-col gap-4">
              {groups && groups.length > 0 ? groups.map((group: any) => (
                <Card key={group.id} className="!p-5 border-l-4 border-l-teal-500 hover:-translate-y-1 transition max-w-3xl">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 md:gap-8">
                    <div className="flex-1 flex flex-col min-w-0">
                      <h2 className="text-lg font-bold text-slate-900">{group.name}</h2>
                      <p className="text-slate-600 mt-1.5 text-[13px] leading-relaxed">
                        {group.description || <span className="italic opacity-50">Popis nebol poskytnutý</span>}
                      </p>
                      <div className="font-mono text-[9px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                        NET-ID: {group.id}
                      </div>
                    </div>
                    <div className="w-full md:w-[280px] shrink-0 border-t border-slate-100 pt-4 md:border-t-0 md:pt-0">
                      <RequestJoinGroupForm groupId={group.id} availablePoints={availablePoints} />
                    </div>
                  </div>
                </Card>
              )) : (
                <Card className="flex flex-col items-center justify-center p-8 text-center text-slate-500 max-w-3xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 mb-3"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <p className="max-w-sm text-sm">Nenašli sa žiadne verejne objaviteľné skupiny zodpovedajúce predlohe.</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
