export default function ReportingPage() {
  return (
    <div className="min-h-[80vh] p-8 bg-slate-50 text-slate-900 flex flex-col items-center justify-center text-center">
      <div className="bg-white border border-slate-200 p-10 rounded-2xl shadow-sm max-w-lg w-full">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Reporting Analytics</h1>
        <p className="text-slate-600 mb-6">
          Táto sekcia je momentálne vo vývoji. Získate tu kompletný prehľad o tokoch, alokovaných kapacitách a štatistiky zdieľania EIC miest.
        </p>
        <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-md border border-emerald-200">
          Už Čoskoro
        </span>
      </div>
    </div>
  );
}
