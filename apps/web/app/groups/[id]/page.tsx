import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import InviteMemberForm from './InviteMemberForm';
import AssignMeteringPointForm from './AssignMeteringPointForm';
import HandleJoinRequestForm from './HandleJoinRequestForm';
import ToggleDiscoverable from './ToggleDiscoverable';
import RemoveMeteringPointButton from './RemoveMeteringPointButton';
import InviteMeteringPointForm from './InviteMeteringPointForm';
import UpdateGroupPoliciesForm from './UpdateGroupPoliciesForm';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';

async function fetchGroup(id: string, token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/groups/${id}`, {
      headers: {
        Cookie: `token=${token}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 404) return { notFound: true };
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

async function fetchMe(token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/auth/me`, {
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

async function fetchMembers(id: string, token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/groups/${id}/members`, {
      headers: {
        Cookie: `token=${token}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

async function fetchAssignedPoints(id: string, token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/groups/${id}/metering-points`, {
      headers: {
        Cookie: `token=${token}`,
      },
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
      headers: {
        Cookie: `token=${token}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchPendingJoinRequests(id: string, token: string) {
  try {
    const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/groups/${id}/join-requests`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const result = await fetchGroup(resolvedParams.id, token);

  if (!result || result.notFound) {
    return (
      <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex flex-col items-center">
        <main className="w-full max-w-2xl text-center flex flex-col gap-4 items-center">
          <h1 className="text-2xl font-bold text-red-600">Skupina nebola nájdená</h1>
          <p className="text-slate-600">Skupina, ktorú hľadáte, neexistuje alebo k nej nemáte prístup.</p>
          <Link href="/groups" className="px-5 py-2 mt-4 bg-emerald-600 text-white shadow-sm font-semibold rounded-lg hover:bg-emerald-700">
            Späť na skupiny
          </Link>
        </main>
      </div>
    );
  }

  const group = result;
  const members = await fetchMembers(resolvedParams.id, token);
  const me = await fetchMe(token);
  const assignedPoints = await fetchAssignedPoints(resolvedParams.id, token);
  const myPoints = await fetchMyPoints(token);

  const availablePoints = myPoints?.filter((p: any) => !p.groupId && (!p.joinRequests || p.joinRequests.length === 0)) || [];
  const isOwner = group.ownerId === me?.id || members?.some((m: any) => m.user.id === me?.id && m.role === 'OWNER');
  
  const pendingRequests = isOwner ? await fetchPendingJoinRequests(resolvedParams.id, token) : [];

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900 flex flex-col items-center">
      <main className="w-full max-w-2xl flex flex-col gap-6 font-[family-name:var(--font-geist-sans)]">
        <SectionHeader 
          title="Ovládací panel skupiny"
          description="Spravujte politiky zdieľanej siete, členov a pripojené miesta."
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
          action={
            <div className="flex gap-4 items-center">
              {isOwner ? (
                <ToggleDiscoverable groupId={group.id} initial={group.isDiscoverable} />
              ) : group.isDiscoverable && (
                <Badge variant="public">VEREJNE OBJAVITEĽNÁ</Badge>
              )}
            </div>
          }
        />

        <Card className="flex flex-col gap-4">
          <div>
            <h2 className="text-xs text-slate-500 font-bold uppercase tracking-widest">Názov skupiny</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{group.name}</span>
              <Badge variant={group.isDiscoverable ? 'public' : 'private'}>{group.isDiscoverable ? 'Verejná' : 'Súkromná'}</Badge>
            </div>
          </div>
          
          <div>
            <h2 className="text-xs text-slate-500 font-bold uppercase tracking-widest">Popis</h2>
            <p className="text-base text-slate-700 mt-1">{group.description || <span className="text-slate-400 italic">Popis nebol poskytnutý</span>}</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {!group.isActive && <Badge variant="danger">NEAKTÍVNA</Badge>}
            {!group.acceptsJoinRequests && <Badge variant="danger">ŽIADNE ŽIADOSTI O PRIPOJENIE</Badge>}
            {!group.acceptsInvitations && <Badge variant="danger">ŽIADNE POZVÁNKY</Badge>}
            {group.acceptedMeteringPointTypes !== 'BOTH' && (
              <Badge variant="public">{group.acceptedMeteringPointTypes === 'PRODUCTION_ONLY' ? 'IBA VÝROBNÉ' : 'IBA ODBERNÉ'}</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
            <div>
              <h2 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID skupiny</h2>
              <p className="text-xs text-slate-600 mt-1 font-mono break-all">{group.id}</p>
            </div>
            <div>
              <h2 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID vlastníka</h2>
              <p className="text-xs text-slate-600 mt-1 font-mono break-all">{group.ownerId}</p>
            </div>
          </div>
        </Card>

        {isOwner && (
          <UpdateGroupPoliciesForm 
            groupId={group.id} 
            initialPolicies={{
              isActive: group.isActive ?? true,
              acceptsJoinRequests: group.acceptsJoinRequests ?? true,
              acceptsInvitations: group.acceptsInvitations ?? true,
              acceptedMeteringPointTypes: group.acceptedMeteringPointTypes ?? 'BOTH',
            }}
          />
        )}

        <div className="flex flex-col gap-4">
          <SectionHeader 
            title="Priradené pripojené miesta" 
            description={`Aktuálne aktívne zdieľajúce energiu. Celkom zariadení: ${assignedPoints ? assignedPoints.length : 0}`} 
          />
          <div className="flex flex-col gap-3">
            {assignedPoints && assignedPoints.length > 0 ? assignedPoints.map((point: any) => (
              <Card key={point.id} className="relative overflow-hidden p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 flex gap-2 items-center">
                      {point.name || 'Nepomenované zariadenie'}
                      <Badge variant="assigned">AKTÍVNE</Badge>
                    </h3>
                    <p className="text-slate-500 text-sm font-mono mt-1">EIC: {point.eic}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${
                      point.type === 'PRODUCTION' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                    }`}>
                      {point.type}
                    </span>
                    {isOwner && (
                      <RemoveMeteringPointButton groupId={group.id} pointId={point.id} />
                    )}
                  </div>
                </div>
              </Card>
            )) : (
              <div className="text-slate-500 text-sm italic py-4">V tejto skupine aktuálne nie sú priradené žiadne pripojené miesta.</div>
            )}
          </div>
          <AssignMeteringPointForm groupId={group.id} availablePoints={availablePoints} />
          {isOwner && <InviteMeteringPointForm groupId={group.id} />}
        </div>

        {isOwner && pendingRequests.length > 0 && (
          <div className="flex flex-col gap-4 mt-6">
            <h2 className="text-xl font-bold bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-xl shadow-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Čakajúce žiadosti ({pendingRequests.length})
            </h2>
            <div className="flex flex-col gap-3">
              {pendingRequests.map((req: any) => (
                <Card key={req.id} className="relative overflow-hidden p-5 border-amber-300 bg-amber-50 hover:shadow-md">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pl-4">
                    <div className="flex flex-col gap-1">
                      <div className="font-bold flex items-center gap-2 text-slate-900">
                        {req.meteringPoint.eic}
                        <Badge variant="pending">Čaká na schválenie</Badge>
                      </div>
                      <div className="text-sm text-slate-600 font-mono">{req.meteringPoint.name || 'Nepomenované zariadenie'} ({req.meteringPoint.type})</div>
                      <div className="text-xs text-slate-500 mt-1">Žiadateľ: <span className="font-medium text-slate-700">{req.requestedByUser?.email || req.requestedByUserId}</span></div>
                    </div>
                    <HandleJoinRequestForm requestId={req.id} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-8">
          <SectionHeader 
            title="Prístupová vrstva (Členovia)" 
            description="Používatelia s prístupom na správu alebo prezeranie tejto skupiny."
          />
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
            {members && members.length > 0 ? members.map((member: any, idx: number) => (
              <div key={member.id} className={`p-4 flex justify-between items-center ${idx !== members.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div>
                  <div className="font-bold text-slate-900">{member.user.email}</div>
                  {(member.user.firstName || member.user.lastName) && (
                    <div className="text-sm text-slate-600">
                      {member.user.firstName} {member.user.lastName}
                    </div>
                  )}
                </div>
                <div className={`text-[10px] uppercase px-2 py-1 rounded-md font-bold tracking-widest ${member.role === 'OWNER' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                  {member.role}
                </div>
              </div>
            )) : (
              <div className="p-4 text-slate-500 text-sm">Nenašli sa žiadni členovia.</div>
            )}
          </div>
        </div>

        {isOwner && <InviteMemberForm groupId={group.id} />}

      </main>
    </div>
  );
}
