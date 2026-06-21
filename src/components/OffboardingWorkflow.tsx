import React, { useState } from 'react';
import { useDB } from '../store/DBContext';
import { OffboardingCase } from '../types';
import { dictionary } from '../store/translations';
import { Sparkles, ArrowRightLeft, Check, FileDown, ShieldAlert, BadgeAlert } from 'lucide-react';

export const OffboardingWorkflow: React.FC = () => {
  const { currentLanguage, offboardingCases, companies, checklistItems, updateChecklistItem, triggerAISolver } = useDB();
  const t = dictionary[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [selectedCase, setSelectedCase] = useState<OffboardingCase | null>(offboardingCases[0] || null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Filter checklist
  const activeChecklist = selectedCase ? checklistItems.filter(item => item.offboardingCaseId === selectedCase.id) : [];

  const handleAssembleDossierReport = async (cCase: OffboardingCase) => {
    setAiLoading(true);
    setAiResultText(null);
    try {
      const parentComp = companies.find(c => c.id === cCase.companyId);
      const resp = await triggerAISolver('offboard_report', { 
        companyName: parentComp ? parentComp.legalNameEn : 'the LSA Client',
        caseId: cCase.id,
        caseTitle: cCase.title 
      });
      setAiReport(resp);
    } catch(e) {
      setAiReport('Failed to query secure Gemini agent.');
    }
    setAiLoading(false);
  };

  const [aiResultText, setAiResultText] = useState<string | null>(null);

  // Stages names (the 11 steps for agent replacement/exit)
  const stepsList = [
    'File preparation',
    'Drafting replacement deed',
    'Local notary signature',
    'DED application submission',
    'Chamber registration',
    'Ministry of Labour closure',
    'GDRFA visa cancellations',
    'Corporate Bank freeze',
    'Utility ledger retirement',
    'Security sign-off',
    'Archival registration'
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans p-2">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">{t.menuOffboarding}</h3>
        <p className="text-xs text-slate-500 mt-1">
          Review legal exit paths, liquidations, and replacement deeds of Local Service Agent ties across UAE entities.
        </p>
      </div>

      <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-950 rounded-lg text-xs space-y-1">
        <h4 className="font-bold flex items-center space-x-1.5">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>LSA Legal protection shield (Sec 2.D)</span>
        </h4>
        <p>Before executing agency exit agreements, ensure all worker visas are fully cancelled or transferred on the MOHRE portal, and corporate bank balances have been retired to completely shield your name from financial liabilities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        
        {/* Left cases list */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-950 text-sm">Active Exit Dossiers ({offboardingCases.length})</h4>
          
          <div className="space-y-3">
            {offboardingCases.map(c => {
              const comp = companies.find(cp => cp.id === c.companyId);
              return (
                <div 
                  key={c.id}
                  onClick={() => { setSelectedCase(c); setAiReport(null); }}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                    selectedCase?.id === c.id ? 'border-red-500 bg-red-50/20' : 'border-gray-100 bg-slate-50 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-950 text-xs block">{comp ? comp.legalNameEn : 'Archived Case'}</span>
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[8.5px] font-black uppercase text-right">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 italic mt-0.5">{c.reason}</p>
                  <p className="text-[10px] text-indigo-600 font-semibold font-mono">Assigned Sponsor: {c.assignedTo === 'u1' ? 'Me' : 'Staff Agent'}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right case work area */}
        <div className="lg:col-span-8">
          {selectedCase ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              
              {/* Top info */}
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">Exit Work Area</span>
                <p className="font-black text-slate-950 text-base">{selectedCase.title}</p>
                <p className="text-gray-500 mt-1">Initiation date: <strong className="font-mono">{selectedCase.initiatedDate || '2026-06-20'}</strong> | Security rating Check: <strong className="text-red-600 uppercase font-black">{selectedCase.riskLevel} Escalation</strong></p>
              </div>

              {/* Horizontal 11 stage status tracker */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold uppercase tracking-wide text-slate-500 text-[10px]">11-Step Legally compliant replacement roadmap:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-[180px] overflow-y-auto bg-slate-50 p-3 rounded-xl">
                  {stepsList.map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-2 p-1.5 bg-white rounded border border-gray-100">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[9px]">{idx + 1}</span>
                      <span className="text-[10px] text-slate-700 font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protection checklists */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase tracking-wide text-slate-400 text-[10px]">{t.checklistHeader}</h4>
                <div className="space-y-2">
                  {activeChecklist.map(chi => (
                    <div key={chi.id} className="p-3 bg-slate-50 hover:bg-slate-100/50 rounded-xl transition border border-gray-100 flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateChecklistItem(chi.id, { status: chi.status === 'Completed' ? 'Pending' : 'Completed' })}
                          className={`w-4 h-4 rounded border flex items-center justify-center font-bold text-[9px] ${
                            chi.status === 'Completed' ? 'bg-indigo-600 text-white' : 'border-gray-200 bg-white'
                          }`}
                        >
                          {chi.status === 'Completed' && '✓'}
                        </button>
                        <span className={chi.status === 'Completed' ? 'line-through text-slate-400 font-medium' : 'text-slate-900 font-semibold'}>{chi.title}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        chi.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {chi.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secure export with AI report */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">Total protective checks: {activeChecklist.filter(c => c.status === 'Completed').length} / {activeChecklist.length}</span>
                  
                  <button 
                    onClick={() => handleAssembleDossierReport(selectedCase)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition text-xs flex items-center space-x-1"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>{t.exportReportBtn}</span>
                  </button>
                </div>

                {aiLoading && (
                  <div className="p-4 bg-slate-900 text-slate-300 rounded-xl text-xs animate-pulse text-center">
                    🧠 Wakeel AI compilation engine compiling notarized deed replacement scans...
                  </div>
                )}

                {aiReport && (
                  <div className="p-4 bg-indigo-950 text-white rounded-xl text-xs space-y-2 relative">
                    <button onClick={() => setAiReport(null)} className="absolute right-3 top-2 text-slate-300 hover:text-white">✕</button>
                    <div className="flex items-center space-x-2 text-indigo-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-extrabold">Compiled LSA Withdrawal Protection Dossier:</span>
                    </div>
                    <pre className="bg-indigo-900/40 p-4 rounded-lg font-mono text-[11px] whitespace-pre-line leading-relaxed shadow-inner max-h-[200px] overflow-y-auto">
                      {aiReport}
                    </pre>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-200 text-center text-xs text-gray-400 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-500">No active withdrawal file selected</p>
              <p>Choose an exit dossier from the left dashboard list to review the 11-step deed replacement tracking, execute protection checkmarks, or export legal dossiers.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
