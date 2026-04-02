import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CreateGroupForm from './CreateGroupForm';
import Link from 'next/link';

async function fetchGroups(token: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/groups`, {
      headers: {
        Cookie: `token=${token}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function GroupsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const groups = await fetchGroups(token);

  if (!groups) {
    return (
      <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex flex-col items-center">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">Nepodarilo sa načítať skupiny. Skontrolujte svoje pripojenie.</div>
        <Link href="/" className="mt-4 text-emerald-600 font-medium hover:text-emerald-700 hover:underline transition">Návrat domov</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex flex-col items-center">
      <main className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Moje skupiny</h1>
          <div className="flex gap-4 items-center">
            <Link href="/groups/discover" className="text-sm font-semibold bg-white text-emerald-700 border border-emerald-200 shadow-sm hover:bg-emerald-50 hover:border-emerald-300 transition px-4 py-2 rounded-lg">
              Prehľad Verejných skupín
            </Link>
          </div>
        </div>

        <CreateGroupForm />

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-800">Existujúce skupiny</h2>
          {groups.length === 0 ? (
            <p className="text-slate-500 italic">Zatiaľ nemáte žiadne skupiny.</p>
          ) : (
            groups.map((group: any) => (
              <Link href={`/groups/${group.id}`} key={group.id} className="block border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition shadow-sm rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900">{group.name}</h3>
                {group.description && <p className="text-slate-600 mt-1">{group.description}</p>}
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mt-4">Vytvorené: {new Date(group.createdAt).toLocaleDateString()}</div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
