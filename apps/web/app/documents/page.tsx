export default function DocumentsPage() {
  const documents = [
    { title: 'Zmluva o zdieľaní elektrickej energie v spoločnej skupine', info: 'Povinná pre pripojenie do skupiny' },
    { title: 'Všeobecné obchodné podmienky (VOP)', info: 'Aktuálna verzia' },
    { title: 'Súhlas so spracovaním údajov pre OKTE (EDC)', info: 'Povinná pre validáciu meracích bodov' },
    { title: 'Cenník administratívnych poplatkov', info: 'Platný pre tento rok' },
  ];

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dokumenty</h1>
        <p className="text-lg text-slate-600">
          V tejto sekcii si môžete stiahnuť a skontrolovať kľúčové dokumenty, zmluvy a obchodné podmienky súvisiace so správou a účasťou na platforme Zdieľaná Elektrina.
        </p>

        <div className="grid gap-4 mt-4">
          {documents.map((doc, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-emerald-300 transition gap-4">
              <div className="flex gap-4 items-start sm:items-center">
                <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600 shrink-0 mt-1 sm:mt-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{doc.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{doc.info}</p>
                </div>
              </div>
              <button disabled className="mt-2 sm:mt-0 whitespace-nowrap bg-slate-100 text-slate-400 font-semibold px-5 py-2.5 rounded-lg border border-slate-200 cursor-not-allowed">
                Pripravuje sa
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
