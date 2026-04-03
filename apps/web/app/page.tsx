import { cookies } from 'next/headers';
import Link from 'next/link';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/auth/me`, {
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

export default async function Home() {
  const user = await getUser();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  if (user) {
    return (
      <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex flex-col items-center">
        <main className="w-full max-w-4xl flex flex-col gap-8 mt-6">
          <h1 className="text-4xl font-extrabold text-emerald-800 tracking-tight">Osobný Dashboard</h1>
          
          <div className="flex flex-col gap-4 border border-emerald-200 bg-emerald-50 p-6 rounded-xl items-center sm:items-start text-emerald-900 shadow-sm w-full">
            <div>
              <strong className="text-emerald-700 uppercase tracking-wider text-xs block mb-1">Prihlásený používateľ</strong>
              <div className="font-medium text-lg">{user.email}</div>
              {user.firstName && <div className="text-slate-600 mt-1">{user.firstName} {user.lastName}</div>}
            </div>
            
            {/* Navigácia bola presunutá do nového Sidebar panelu */}
          </div>
        </main>
      </div>
    );
  }

  // Render Landing Page pre hostí
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="flex justify-center mb-8">
          <div className="bg-emerald-100 p-4 rounded-3xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
              <path d="M12 2C8 6 3 9 3 14a9 9 0 0 0 18 0c0-5-5-8-9-12z" />
              <path d="M13 8l-3 4h4l-3 4" />
              <path d="M12 18v1" />
            </svg>
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Prepojte svoju energiu so svetom
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Moderná platforma pre bezpečné, inteligentné a legislatívne transparentné zdieľanie elektrickej energie. Priraďte svoje odberné/výrobné miesta, budujte skupiny a zapájajte sa do energetických komunít v reálnom čase.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition hover:-translate-y-0.5">
            Vytvoriť účet zadarmo
          </Link>
          <Link href="/login" className="px-8 py-4 bg-white text-slate-700 border border-slate-300 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition">
            Prihlásiť sa
          </Link>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-white border-t border-slate-200 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Ako systém funguje</h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-lg">Zdieľaná Elektrina prepája majiteľov odberných a výrobných miest v troch jednoduchých krokoch.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:border-emerald-300 hover:shadow-md transition">
              <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <span className="text-emerald-700 text-2xl font-black">1</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Zaregistrujte OOM / VOM</h3>
              <p className="text-slate-600 leading-relaxed">
                Do systému si pripojíte všetky svoje fyzické meracie body identifikované pomocou unikátneho EIC. Aplikácia zastrešuje tak odberné, ako aj výrobné miesta.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:border-emerald-300 hover:shadow-md transition">
              <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <span className="text-emerald-700 text-2xl font-black">2</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Objavujte a Pripájajte</h3>
              <p className="text-slate-600 leading-relaxed">
                Staňte sa členom otvorených Skupín prostredníctvom žiadostí o priradenie, alebo združte svoju sieť ako Majiteľ komunity s exkluzívnymi pozvánkami pre vybraných členov.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:border-emerald-300 hover:shadow-md transition">
              <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <span className="text-emerald-700 text-2xl font-black">3</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Bezpečná Správa</h3>
              <p className="text-slate-600 leading-relaxed">
                Platforma obsahuje prísne overovacie mechanizmy. Zabráni hardvérovým duplikátom a zaisťuje plynulý prevod pripojených miest, aby vždy bezpečne existovali maximálne v 1 aktívnej skupine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Check Section */}
      <section className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <a
              className="rounded-full border border-slate-300 bg-white text-slate-600 transition-colors flex items-center justify-center hover:bg-slate-100 text-sm font-medium h-10 px-5 shadow-sm"
              href="/status"
            >
              Uptime status webu
            </a>
        </div>
      </section>
    </div>
  );
}
