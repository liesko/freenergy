import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import InviteActions from './InviteActions';
import HandleJoinRequestForm from '../groups/[id]/HandleJoinRequestForm';
import CancelRequestButton from '../metering-points/CancelRequestButton';
import HandleMpInvitationForm from '../metering-point-invitations/HandleMpInvitationForm';
import GlobalInviteMeteringPointForm from './GlobalInviteMeteringPointForm';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';

async function fetchUserInvitations(token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/invitations`, { headers: { Cookie: `token=${token}` }, cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchSentJoinRequests(token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/join-requests/sent`, { headers: { Cookie: `token=${token}` }, cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchReceivedJoinRequests(token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/join-requests/received`, { headers: { Cookie: `token=${token}` }, cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchUserGroups(token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/groups`, { headers: { Cookie: `token=${token}` }, cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function fetchUserMeteringPointInvitations(token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/metering-point-invitations`, { headers: { Cookie: `token=${token}` }, cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function RequestsPage(props: { searchParams: Promise<{ view?: string }> }) {
  const searchParams = await props.searchParams;
  const view = searchParams.view || 'received'; // default view

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  // Načítanie skupín užívateľa pre potreby formulára
  const groups = await fetchUserGroups(token);
  // Z vyfiltrovania potrebujeme len tie skupiny, kde má používateľ oprávnenie OWNER = pridať môže buď the native ownerId, alebo kde je OWNER
  const managedGroups = groups.filter((g: any) => g.role === 'OWNER' || g.ownerId);

  // Podľa pohľadu načítame len to, čo treba
  let userInvitations = null;
  let sentRequests = null;
  let receivedRequests = null;
  let userMpInvitations = null;

  if (view === 'user-invitations') {
    userInvitations = await fetchUserInvitations(token);
  } else if (view === 'sent') {
    sentRequests = await fetchSentJoinRequests(token);
    userMpInvitations = await fetchUserMeteringPointInvitations(token);
  } else {
    receivedRequests = await fetchReceivedJoinRequests(token);
  }

  const hasFetchError = 
    (view === 'user-invitations' && userInvitations === null) ||
    (view === 'sent' && (sentRequests === null || userMpInvitations === null)) ||
    (view === 'received' && receivedRequests === null);

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 bg-slate-50 text-slate-900 font-[family-name:var(--font-geist-sans)] flex justify-center">
      <main className="flex flex-col gap-8 w-full max-w-4xl">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 mb-2">
          <SectionHeader 
            title="Centrum Žiadostí" 
            description="Spravujte vaše odoslané žiadosti o vstup zariadení, schvaľujte žiadosti do vašich skupín alebo spravujte vaše osobné pozvánky."
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>}
          />
          
          <div className="flex flex-wrap gap-4 items-center mt-2">
            <Link 
              href="/invitations?view=received" 
              className={`text-sm font-semibold border shadow-sm transition px-5 py-2.5 rounded-lg ${view === 'received' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            >
              Schvaľovanie do mojich skupín
            </Link>

            <Link 
              href="/invitations?view=sent" 
              className={`text-sm font-semibold border shadow-sm transition px-5 py-2.5 rounded-lg ${view === 'sent' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            >
              Žiadosti k EIC
            </Link>

            <Link 
              href="/invitations?view=user-invitations" 
              className={`text-sm font-semibold border shadow-sm transition px-5 py-2.5 rounded-lg ${view === 'user-invitations' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            >
              Osobné pozvánky
            </Link>
          </div>
        </div>

        {hasFetchError && (
          <div className="p-4 border border-red-800 bg-red-900/20 text-red-400 rounded-lg max-w-2xl">
            Nepodarilo sa načítať údaje. API môže byť nedostupné.
          </div>
        )}



        {/* TAB 1: Prijaté žiadosti na schválenie (Received) */}
        {view === 'received' && receivedRequests && (
          <div className="flex flex-col gap-4 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-800">Prišli do vašich skupín</h2>
            {receivedRequests.length === 0 ? (
              <p className="text-slate-500 italic p-6 bg-slate-100 rounded-xl border border-slate-200">
                Nemáte žiadne nevybavené žiadosti iných používateľov o pripojenie ich zariadení do vašich skupín.
              </p>
            ) : (
              receivedRequests.map((req: any) => (
                <Card key={req.id} className="p-5 border-l-4 border-l-emerald-500 flex flex-col sm:flex-row justify-between items-start gap-4 hover:shadow-md transition">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900">{req.group?.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Žiada o pripojenie: <span className="font-semibold">{req.meteringPoint?.name || 'Nepomenované'}</span> (EIC: {req.meteringPoint?.eic})
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Vlastník zariadenia: {req.meteringPoint?.user?.email}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-3">
                      Prijaté: {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-full sm:w-auto mt-2 sm:mt-0 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <HandleJoinRequestForm requestId={req.id} />
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Žiadosti k EIC (Sent requests + Received MP invitations) */}
        {view === 'sent' && sentRequests && userMpInvitations && (
          <div className="flex flex-col gap-8 max-w-2xl">
            {/* Sekcia prichádzajúcich pozvánok do EIC */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-slate-800">Do vašich zariadení</h2>
              {userMpInvitations.length === 0 ? (
                <p className="text-slate-500 italic p-6 bg-slate-100 rounded-xl border border-slate-200">
                  Vaše pripojené miesta zatiaľ neobdržali žiadne pozvánky od skupín.
                </p>
              ) : (
                userMpInvitations.map((inv: any) => (
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

            {/* Sekcia odchádzajúcich žiadostí EIC */}
            <div className="flex flex-col gap-4 border-t border-slate-200 pt-6">
              <h2 className="text-xl font-bold text-slate-800">Odoslané do skupín</h2>
              {sentRequests.length === 0 ? (
                <p className="text-slate-500 italic p-6 bg-slate-100 rounded-xl border border-slate-200">
                  Netvoríte žiadne požiadavky na pripojenie vašich EIC miest do cudzích skupín.
                </p>
              ) : (
                sentRequests.map((req: any) => (
                  <Card key={req.id} className="p-5 border-l-4 border-l-amber-400 flex flex-col sm:flex-row justify-between items-start gap-4 hover:shadow-md transition">
                    <div className="flex flex-col">
                      <h3 className="text-lg font-bold text-slate-900">Do: {req.group?.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Tvoje zariadenie: <span className="font-semibold">{req.meteringPoint?.name || 'Nepomenované'}</span> (EIC: {req.meteringPoint?.eic})
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-3">
                        Odoslané: {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-full sm:w-auto shrink-0 self-end">
                      <CancelRequestButton requestId={req.id} />
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Osobné pozvánky používateľa */}
        {view === 'user-invitations' && userInvitations && (
          <div className="flex flex-col gap-4 max-w-2xl">
            <GlobalInviteMeteringPointForm groups={managedGroups} />
            
            <h2 className="text-xl font-bold text-slate-800 mt-4">Osobné pozvánky do skupín</h2>
            {userInvitations.length === 0 ? (
              <p className="text-slate-500 italic p-6 bg-slate-100 rounded-xl border border-slate-200">
                Nemáte žiadne čakajúce osobné pozvánky pre váš užívateľský účet.
              </p>
            ) : (
              userInvitations.map((invite: any) => (
                <Card key={invite.id} className="p-5 border-l-4 border-l-blue-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Skupina: {invite.group?.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">
                      Pozvaný od: <span className="font-semibold">{invite.invitedByUser?.email}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-2">
                      Prijaté: {new Date(invite.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-full sm:w-auto">
                    <InviteActions invitationId={invite.id} />
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
