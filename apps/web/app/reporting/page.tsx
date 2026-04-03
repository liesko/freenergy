import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';

async function fetchStats(token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/users/me/energy-stats`, {
      headers: {
        Cookie: `token=${token}`,
      },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ReportingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const stats = await fetchStats(token);

  if (!stats) {
    return (
      <div className="min-h-screen p-8 sm:p-20 bg-slate-50 flex justify-center">
        <main className="w-full max-w-4xl text-center">
          <p className="text-red-500 bg-red-50 p-6 rounded-xl border border-red-200">
            Nepodarilo sa načítať štatistiky. Skontrolujte pripojenie na API.
          </p>
        </main>
      </div>
    );
  }

  const { currentMonth, hasProduction, hasConsumption, history } = stats;

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 bg-slate-50 text-slate-900 font-[family-name:var(--font-geist-sans)] flex justify-center">
      <main className="flex flex-col gap-8 w-full max-w-4xl">
        <SectionHeader 
          title="Reporting energie" 
          description="Prehľad vašej výrobnej a spotrebnej bilancie za posledný polrok."
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>}
        />

        {/* Hlavné Panely */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white flex flex-col gap-2 relative overflow-hidden border-2 border-emerald-500">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-50 rounded-full blur-xl"></div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest relative z-10">Vyrobené energiu (Aktuálny mesiac)</h3>
            <div className="flex items-end gap-3 relative z-10">
              <span className="text-5xl font-black text-slate-900">{currentMonth.produced}</span>
              <span className="text-xl font-bold text-emerald-600 mb-1">kWh</span>
            </div>
            {!hasProduction && <p className="text-xs text-slate-400 mt-2">Nemáte priradené žiadne výrobné miesta, z ktorých by sa rátala vaša produkcia.</p>}
          </Card>

          <Card className="p-6 bg-white flex flex-col gap-2 relative overflow-hidden border border-slate-200">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-cyan-50 rounded-full blur-xl"></div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest relative z-10">Spotrebované z vašej vyrobenej energie</h3>
            <div className="flex items-end gap-3 relative z-10">
              <span className="text-5xl font-black text-slate-900">{currentMonth.consumedFromProduction}</span>
              <span className="text-xl font-bold text-cyan-600 mb-1">kWh</span>
            </div>
            {!hasConsumption && <p className="text-xs text-slate-400 mt-2">Poznámka: Ak nie ste spotrebiteľom, toto je energia využitá primárne zvyškami v sieťach.</p>}
          </Card>
        </div>

        {/* Graf Histórie (Tailwind CSS) */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
            Polročný vývoj prenosu energie
          </h2>
          
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm w-full h-80 flex items-end gap-4 md:gap-8 overflow-x-auto relative">
            <div className="absolute top-4 left-6 flex gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-400 rounded-sm"></div> Vyrobené vo vašom EIC</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-cyan-400 rounded-sm"></div> Spotrebované (Komunita)</div>
            </div>

            {history.map((record: any, idx: number) => {
              const maxVal = 500; // predpokladane max graph y
              const prodHeight = (record.Vyrobené / maxVal) * 100;
              const consHeight = (record.Spotrebované / maxVal) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 min-w-[50px] relative z-10 group">
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-20">
                    <div>Výroba: {record.Vyrobené} kWh</div>
                    <div className="text-cyan-300">Spotreba: {record.Spotrebované} kWh</div>
                  </div>

                  {/* Stĺpce */}
                  <div className="relative w-full h-[80%] flex justify-center items-end gap-1">
                    <div 
                      className="w-1/2 bg-emerald-400 rounded-t-sm shadow-sm transition-all duration-1000 ease-in-out hover:opacity-80 cursor-pointer" 
                      style={{ height: `${prodHeight}%` }}
                    ></div>
                    <div 
                      className="w-1/2 bg-cyan-400 rounded-t-sm shadow-sm transition-all duration-1000 ease-in-out hover:opacity-80 cursor-pointer" 
                      style={{ height: `${consHeight}%` }}
                    ></div>
                  </div>
                  
                  {/* Menovka osi X */}
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase border-t border-slate-100 w-full text-center pt-2">
                    {record.name}
                  </div>
                </div>
              );
            })}
            
            {/* Osi mriezky v pozadi */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-6 md:p-8 pt-[20%]">
               <div className="border-t border-slate-100 w-full"></div>
               <div className="border-t border-slate-100 w-full"></div>
               <div className="border-t border-slate-100 w-full"></div>
               <div className="border-t border-slate-100 w-full"></div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
