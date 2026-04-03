import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CreateMeteringPointForm from './CreateMeteringPointForm';
import LeaveGroupButton from './LeaveGroupButton';
import CancelRequestButton from './CancelRequestButton';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';

async function getMeteringPoints(token: string) {
  const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${API_URL}/metering-points`, {
      headers: {
        Cookie: `token=${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { error: 'unauthorized' };
      }
      return { error: 'failed' };
    }

    const data = await res.json();
    return { data };
  } catch {
    return { error: 'failed' };
  }
}

export default async function MeteringPointsPage(props: { searchParams: Promise<{ view?: string }> }) {
  const searchParams = await props.searchParams;
  const view = searchParams.view || 'all';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const { data: meteringPoints, error } = await getMeteringPoints(token);

  if (error === 'unauthorized') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 bg-slate-50 text-slate-900 font-[family-name:var(--font-geist-sans)] flex justify-center">
      <main className="flex flex-col gap-8 w-full max-w-4xl">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 mb-2">
          <SectionHeader 
            title="Miesta" 
            description="Spravujte svoje fyzické hardvérové zariadenia (EIC)."
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
          />
          
          <div className="flex gap-4 items-center mt-2">
            <Link 
              href="/metering-points" 
              className={`text-sm font-semibold border shadow-sm transition px-5 py-2.5 rounded-lg ${view === 'all' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            >
              Moje miesta
            </Link>

            <Link 
              href="/metering-points?view=create" 
              className={`text-sm font-semibold border shadow-sm transition px-5 py-2.5 rounded-lg ${view === 'create' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'}`}
            >
              + Pridaj miesto
            </Link>
          </div>
        </div>

        {error === 'failed' && (
          <div className="p-4 border border-red-800 bg-red-900/20 text-red-400 rounded-lg max-w-2xl">
            Nepodarilo sa načítať pripojené miesta. API môže byť nedostupné.
          </div>
        )}

        {view === 'create' ? (
          <div className="max-w-2xl">
            <CreateMeteringPointForm />
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-2xl">
            {meteringPoints && meteringPoints.length > 0 ? (
              meteringPoints.map((point: any) => (
                <Card key={point.id} className="relative overflow-hidden p-6 hover:-translate-y-1 transition duration-200">
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${point.type === 'PRODUCTION' ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                      <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2 mb-1">
                        {point.name || 'Nepomenované zariadenie'}
                        <Badge variant={point.group ? 'assigned' : (point.joinRequests?.length > 0 || point.invitations?.length > 0) ? 'pending' : 'available'}>
                          {point.group ? 'Priradené' : (point.joinRequests?.length > 0 || point.invitations?.length > 0) ? 'Čaká sa' : 'Dostupné'}
                        </Badge>
                      </h3>
                      <p className="text-slate-600 text-sm font-mono flex items-center gap-2 bg-slate-100 rounded-md px-2 py-0.5 inline-block border border-slate-200">EIC: {point.eic}</p>
                      <div className="mt-4">
                         <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest border ${
                            point.type === 'PRODUCTION' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                          }`}>
                            {point.type}
                          </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end gap-3 text-left sm:text-right mt-2 sm:mt-0">
                      {point.group && (
                        <div className="flex flex-col sm:items-end gap-1">
                          <span className="text-sm text-slate-500 font-medium">
                            V skupine: <span className="text-emerald-700 font-bold">{point.group.name}</span>
                          </span>
                          <div className="mt-1 w-full sm:w-auto"><LeaveGroupButton pointId={point.id} /></div>
                        </div>
                      )}
                      
                      {!point.group && point.joinRequests?.length > 0 && (
                        <div className="flex flex-col gap-2 w-full">
                          {point.joinRequests.map((r: any) => (
                            <div key={r.id} className="flex flex-col items-start sm:items-end border border-amber-200 bg-amber-50 p-3 rounded-xl gap-2 shadow-sm w-full">
                              <span className="text-sm text-slate-700 font-medium">
                                V rade pre: <span className="text-amber-800 font-bold">{r.group.name}</span>
                              </span>
                              <div className="w-full sm:w-auto"><CancelRequestButton requestId={r.id} /></div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!point.group && point.invitations?.length > 0 && (
                        <div className="flex flex-col gap-2 w-full">
                          {point.invitations.map((inv: any) => (
                            <div key={inv.id} className="flex flex-col items-start sm:items-end border border-teal-200 bg-teal-50 p-3 rounded-xl gap-1 shadow-sm w-full">
                              <span className="text-sm text-slate-700 font-medium">
                                Pozvaný skupinou: <span className="text-teal-800 font-bold">{inv.group.name}</span>
                              </span>
                              <Link href="/invitations?view=sent" className="text-xs mt-1 text-teal-600 hover:text-teal-800 font-bold flex items-center gap-1">
                                Skontrolovať v schránke <span aria-hidden="true">&rarr;</span>
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-slate-500 text-sm italic p-6 bg-slate-100 rounded-xl border border-slate-200">
                Zatiaľ ste nezaregistrovali žiadne pripojené miesta. Pridajte svoje prvé miesto cez modré tlačidlo hore.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
