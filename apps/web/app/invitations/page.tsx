import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import InviteActions from './InviteActions';

async function fetchInvitations(token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/invitations`, {
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

export default async function InvitationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const invitations = await fetchInvitations(token);

  if (!invitations) {
    return (
      <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex flex-col items-center">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">Nepodarilo sa načítať pozvánky. Skontrolujte svoje pripojenie.</div>
        <Link href="/" className="mt-4 text-emerald-600 font-medium hover:text-emerald-700 hover:underline transition">Návrat domov</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex flex-col items-center">
      <main className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Moje pozvánky</h1>
        </div>

        <div className="flex flex-col gap-4">
          {invitations.length === 0 ? (
            <p className="text-slate-500 italic">Nemáte žiadne čakajúce pozvánky.</p>
          ) : (
            invitations.map((invite: any) => (
              <div key={invite.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition">
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {invite.group.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    Pozvaný od: <span className="font-semibold">{invite.invitedByUser.email}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">
                    Odoslané: {new Date(invite.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="w-full sm:w-auto">
                  <InviteActions invitationId={invite.id} />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
