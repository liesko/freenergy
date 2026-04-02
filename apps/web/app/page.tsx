import { cookies } from 'next/headers';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-slate-50 text-slate-900">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left">
        <h1 className="text-5xl font-extrabold text-emerald-800 tracking-tight">Platforma Zdieľanej Elektriny</h1>
        <p className="text-xl text-slate-600 max-w-lg">
          Vitajte na platforme pre zdieľanie energie. Základ frontendu je pripravený.
          Biznis funkcie (správa skupín, integrácia OKTE, dashboard) budú implementované čoskoro.
        </p>

        {user ? (
          <div className="flex flex-col gap-4 border border-emerald-200 bg-emerald-50 p-6 rounded-xl items-center sm:items-start text-emerald-900 shadow-sm w-full">
            <div>
              <strong className="text-emerald-700 uppercase tracking-wider text-xs block mb-1">Prihlásený používateľ</strong>
              <div className="font-medium text-lg">{user.email}</div>
              <div className="text-slate-600">{user.firstName} {user.lastName}</div>
            </div>
            <div className="flex gap-4 items-center flex-wrap mt-2">
              <a href="/groups" className="px-5 py-2.5 bg-emerald-600 text-white shadow-sm font-semibold rounded-lg hover:bg-emerald-700 transition">
                Spravovať moje skupiny
              </a>
              <a href="/metering-points" className="px-5 py-2.5 border border-slate-300 text-slate-700 bg-white shadow-sm font-semibold rounded-lg hover:bg-slate-50 transition">
                Moje pripojené miesta (EIC)
              </a>
              <a href="/invitations" className="px-5 py-2.5 border border-slate-300 text-slate-700 bg-white shadow-sm font-semibold rounded-lg hover:bg-slate-50 transition">
                Pozvánky
              </a>
              <form action={`${API_URL}/auth/logout`} method="POST">
                <button 
                  type="submit" 
                  className="text-sm font-semibold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 px-4 py-2 rounded-lg transition"
                >
                  Odhlásiť sa
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 w-full justify-center sm:justify-start">
            <a href="/login" className="px-6 py-3 bg-emerald-600 text-white shadow-sm font-semibold rounded-lg hover:bg-emerald-700 transition">
              Prihlásiť sa
            </a>
            <a href="/register" className="px-6 py-3 border border-slate-300 bg-white text-slate-700 shadow-sm font-semibold rounded-lg hover:bg-slate-50 transition">
              Vytvoriť účet
            </a>
          </div>
        )}

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-4">
          <a
            className="rounded-full border border-slate-300 bg-white text-slate-600 transition-colors flex items-center justify-center hover:bg-slate-100 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/status"
          >
            Skontrolovať stav webu
          </a>
          <a
            className="rounded-full border border-slate-300 bg-white text-slate-600 transition-colors flex items-center justify-center hover:bg-slate-100 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="http://localhost:3001/health"
            target="_blank"
            rel="noopener noreferrer"
          >
            Skontrolovať stav API
          </a>
        </div>
      </main>
    </div>
  );
}
