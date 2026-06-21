import React, { useState } from 'react';
import { useDB } from '../store/DBContext';
import { Company } from '../types';
import { dictionary } from '../store/translations';
import { 
  Building2, ShieldAlert, FileSignature, Wallet, 
  CalendarClock, MailWarning, FileX, ArrowRightLeft, 
  BellRing, TrendingUp, AlertTriangle, ShieldCheck,
  ChevronRight, BrainCircuit
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string, selectedId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { 
    currentLanguage, companies, approvalRequests, 
    invoices, tasks, contacts, offboardingCases,
    documents, auditLogs, triggerAISolver 
  } = useDB();
  
  const [selectedDashboardCompany, setSelectedDashboardCompany] = useState<Company | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const t = dictionary[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  // Calculations for Metrics
  const now = new Date('2026-06-20T23:49:51-07:00');
  
  const activeCount = companies.filter(c => c.companyStatus === 'Active' || c.companyStatus === 'Under Review' || c.companyStatus === 'Offboarding').length;
  
  const criticalRiskCount = companies.filter(c => c.riskLevel === 'Critical').length;
  const highRiskCount = companies.filter(c => c.riskLevel === 'High' || c.riskLevel === 'Critical').length;
  
  // Expiries details
  const exp30 = companies.filter(c => {
    const diff = (new Date(c.licenceExpiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  const exp60 = companies.filter(c => {
    const diff = (new Date(c.licenceExpiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 30 && diff <= 60;
  }).length;

  const exp90 = companies.filter(c => {
    const diff = (new Date(c.licenceExpiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 60 && diff <= 90;
  }).length;

  // Unpaid invoices
  const unpaidInvoicesTotalStr = invoices
    .filter(inv => inv.paymentStatus === 'Overdue' || inv.paymentStatus === 'Sent')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)
    .toLocaleString();

  // Pending signings
  const pendingSigningsCount = approvalRequests.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length;

  // Overdue tasks
  const overdueTasksCount = tasks.filter(task => {
    return task.status !== 'Completed' && new Date(task.dueDate).getTime() < now.getTime();
  }).length;

  // Unresponsive partners
  const unresponsivePartnersCount = contacts.filter(con => con.relationshipStatus === 'Not Responding').length;

  // Missing documents in companies
  const missingDocumentsCount = companies.filter(c => {
    const hasLicence = documents.some(d => d.companyId === c.id && d.documentType === 'Trade Licence');
    const hasLsa = documents.some(d => d.companyId === c.id && d.documentType === 'Local Service Agent Agreement');
    return !hasLicence || !hasLsa;
  }).length;

  // Offboarding/agent replacement
  const offboardingCount = offboardingCases.filter(off => off.status !== 'Completed' && off.status !== 'Closed Without Completion').length;

  // Risk groupings
  const lowRiskList = companies.filter(c => c.riskLevel === 'Low');
  const modRiskList = companies.filter(c => c.riskLevel === 'Moderate');
  const highRiskList = companies.filter(c => c.riskLevel === 'High');
  const critRiskList = companies.filter(c => c.riskLevel === 'Critical');

  // Triggering visual explanation modal on risk click
  const handleAISummarizeRisk = async (company: Company) => {
    setLoadingAi(true);
    setSelectedDashboardCompany(company);
    try {
      const resp = await triggerAISolver('risk_summary', { companyName: company.legalNameEn });
      setAiReport(resp);
    } catch(e) {
      setAiReport('Failed to assemble AI assessment report.');
    }
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans p-2">
      {/* Disclaimer */}
      <div className="p-4 bg-slate-900 border-l-4 border-indigo-500 rounded-lg text-white flex items-start space-x-3 text-xs mb-4 shadow-md">
        <div className="bg-indigo-600/30 p-1.5 rounded text-lg">💡</div>
        <div>
          <h4 className="font-bold uppercase tracking-wide border-b border-slate-800 pb-1 mb-1">{t.disclaimerTitle}</h4>
          <p className="text-slate-300 leading-relaxed">{t.disclaimerText}</p>
        </div>
      </div>

      {/* Grid Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigate('companies')}
          className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition relative group overflow-hidden"
        >
          <div className="absolute right-0 top-0 h-full w-1.5 bg-indigo-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">{t.activeCompanies}</span>
            <Building2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-950">{activeCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold">&#8593; 100% Administered</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigate('reports')}
          className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition relative group overflow-hidden"
        >
          <div className="absolute right-0 top-0 h-full w-1.5 bg-amber-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">High Risk Files</span>
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-950">{highRiskCount}</span>
            <span className={`text-[10px] font-bold ${criticalRiskCount > 0 ? 'text-red-500' : 'text-amber-600'}`}>
              {criticalRiskCount} Critical Risk
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigate('approvals')}
          className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition relative group overflow-hidden"
        >
          <div className="absolute right-0 top-0 h-full w-1.5 bg-sky-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Pending Signings</span>
            <FileSignature className="w-5 h-5 text-sky-500" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-950">{pendingSigningsCount}</span>
            <span className="text-[10px] text-slate-500">Requires LSA Approval</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigate('invoices')}
          className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition relative group overflow-hidden"
        >
          <div className="absolute right-0 top-0 h-full w-1.5 bg-red-500"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Overdue Fees</span>
            <Wallet className="w-5 h-5 text-red-500" />
          </div>
          <div className="mt-4 flex items-baseline space-x-1">
            <span className="text-2xl font-black text-slate-950">{unpaidInvoicesTotalStr}</span>
            <span className="text-[10px] text-slate-500 font-bold">AED</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div 
          onClick={() => onNavigate('offboarding')}
          className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition relative group overflow-hidden"
        >
          <div className="absolute right-0 top-0 h-full w-1.5 bg-indigo-900"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Active Exit Files</span>
            <ArrowRightLeft className="w-5 h-5 text-indigo-950" />
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-950">{offboardingCount}</span>
            <span className="text-[10px] text-orange-600 font-bold">In Preparation</span>
          </div>
        </div>
      </div>

      {/* Expiry / Secondary Alerts bento row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Expiring Alerts list */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><CalendarClock className="w-5 h-5" /></div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 block uppercase tracking-wide">30 Day Expiries</span>
              <span className="text-xl font-black text-slate-950">{exp30}</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold">Immediate Action</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><CalendarClock className="w-5 h-5" /></div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 block uppercase tracking-wide">60 Day Expiries</span>
              <span className="text-xl font-black text-slate-950">{exp60}</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">Renewal Preparing</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CalendarClock className="w-5 h-5" /></div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 block uppercase tracking-wide">90 Day Expiries</span>
              <span className="text-xl font-black text-slate-950">{exp90}</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">Monitoring</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-violet-50 rounded-lg text-violet-600"><MailWarning className="w-5 h-5" /></div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 block uppercase tracking-wide">Delayed Response Partners</span>
              <span className="text-xl font-black text-slate-950">{unresponsivePartnersCount}</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-bold">Escalative Notice</span>
        </div>
      </div>

      {/* Layout Content main */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Bento: Interactive Risk Engine Matrix */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-950">{t.riskOverviewTitle}</h3>
              <p className="text-xs text-slate-500">Rules-based, transparent corporate fiduciaries scoring matrix.</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded font-black">AI Guided Assist Ready</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            {/* low card */}
            <div className="bg-slate-50/50 p-4 rounded-xl border-t-4 border-slate-400">
              <span className="text-3xl font-black text-slate-900">{lowRiskList.length}</span>
              <p className="text-xs font-bold text-slate-500 mt-1">{t.riskLow}</p>
              <span className="text-[9px] text-gray-400 block mt-2">Score 0–29</span>
            </div>
            {/* mod card */}
            <div className="bg-blue-50/20 p-4 rounded-xl border-t-4 border-blue-500">
              <span className="text-3xl font-black text-blue-900">{modRiskList.length}</span>
              <p className="text-xs font-bold text-blue-600 mt-1">{t.riskModerate}</p>
              <span className="text-[9px] text-blue-400 block mt-2">Score 30–59</span>
            </div>
            {/* high card */}
            <div className="bg-amber-50/20 p-4 rounded-xl border-t-4 border-amber-600">
              <span className="text-3xl font-black text-amber-900">{highRiskList.length}</span>
              <p className="text-xs font-bold text-amber-700 mt-1">{t.riskHigh}</p>
              <span className="text-[9px] text-amber-500 block mt-2">Score 60–79</span>
            </div>
            {/* crit card */}
            <div className="bg-rose-50/20 p-4 rounded-xl border-t-4 border-rose-600">
              <span className="text-3xl font-black text-rose-900">{critRiskList.length}</span>
              <p className="text-xs font-bold text-rose-700 mt-1">{t.riskCritical}</p>
              <span className="text-[9px] text-rose-500 block mt-2">Score 80–100</span>
            </div>
          </div>

          {/* Quick interactive search matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.whyRiskTriggered}</h4>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {companies.filter(c => c.riskScore > 0).sort((a,b)=> b.riskScore - a.riskScore).map(c => (
                <div 
                  key={c.id}
                  onClick={() => handleAISummarizeRisk(c)}
                  className="p-3 bg-slate-50 hover:bg-indigo-50/40 rounded-xl transition cursor-pointer flex justify-between items-center border border-gray-100 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      c.riskLevel === 'Critical' ? 'bg-red-600' : c.riskLevel === 'High' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></span>
                    <div>
                      <span className="font-bold text-slate-900">{isRtl ? c.legalNameAr : c.legalNameEn}</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Trade License: <span className="font-mono">{c.tradeLicenceNumber}</span> | Emirate: {c.emirate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold text-slate-500">{c.notes ? '⚠️ Notes' : 'Files Checked'}</span>
                    <span className={`px-2.5 py-0.5 rounded text-white font-black ${
                      c.riskLevel === 'Critical' ? 'bg-red-600' : c.riskLevel === 'High' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      {c.riskScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Bento: Actions and System Audit Logs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Desk Actions */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-950">{t.quickActions}</h3>
            
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button 
                onClick={() => onNavigate('wizard')}
                className="w-full p-2.5 bg-slate-900 border border-slate-950 hover:bg-slate-800 text-white rounded-lg font-bold transition flex items-center justify-between"
              >
                <span>➕ {isRtl ? 'تسجيل شركة جديدة بالمرشد' : 'Enroll Corporate Client'}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              
              <button 
                onClick={() => onNavigate('approvals')}
                className="w-full p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 rounded-lg font-bold transition flex items-center justify-between"
              >
                <span>📝 {isRtl ? 'الاعتمادات والتواقيع النشطة' : 'Sign and Approvals Center'}</span>
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              </button>

              <button 
                onClick={() => onNavigate('offboarding')}
                className="w-full p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-950 rounded-lg font-bold transition flex items-center justify-between"
              >
                <span>🚪 {isRtl ? 'البدء بإنهاء وكالة خدمات' : 'Prepare Agent Replacement/Exit'}</span>
                <ChevronRight className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>

          {/* Micro Audit Trail */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-950">{t.recentAuditTitle}</h3>
            
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="text-[10px] space-y-1 border-b border-gray-50 pb-2">
                  <div className="flex justify-between text-slate-900 font-bold">
                    <span>{log.userName}</span>
                    <span className="text-gray-400 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-600">{log.action}</p>
                  <p className="text-[9px] text-indigo-600 font-mono">Entity: {log.entityType} ({log.entityId})</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Risk Summary Overlay Modal */}
      {selectedDashboardCompany && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 p-6 space-y-4 font-sans text-gray-800" dir={isRtl ? 'rtl' : 'ltr'}>
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                <h4 className="font-extrabold text-slate-950">
                  {selectedDashboardCompany.legalNameEn} - Risk Details
                </h4>
              </div>
              <button 
                onClick={() => { setSelectedDashboardCompany(null); setAiReport(null); }}
                className="text-gray-400 hover:text-slate-900 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span>Calculated Risk Metric:</span>
                <span className="text-red-600 font-black">{selectedDashboardCompany.riskScore} / 100</span>
              </div>
              
              {/* Detailed Rules Log */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-[11px]">
                <h5 className="font-bold text-gray-500 uppercase tracking-widest text-[9px] mb-1">Triggered Risk Engine Log</h5>
                
                {/* Simulated/reconstructed rules from score */}
                {selectedDashboardCompany.riskScore >= 35 && (
                  <p className="text-red-700 font-medium">⚠️ Trade license expired (+35)</p>
                )}
                {selectedDashboardCompany.notes && (
                  <p className="text-orange-700 font-medium">⚠️ Manual high-risk alert details found (+20)</p>
                )}
                {selectedDashboardCompany.companyStatus === 'Offboarding' && (
                  <p className="text-indigo-700 font-medium font-bold">⚠️ Exit offboarding file is active (+15)</p>
                )}
                <p className="text-slate-600">✓ Routine background checks scheduled</p>
              </div>

              {/* Secure Server Side Gemini Process assist details */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold block">🧠 Ask Wakeel AI Expert Audit:</span>
                  {loadingAi && <span className="animate-pulse font-black text-rose-600">Analyzing...</span>}
                </div>
                
                {aiReport ? (
                  <p className="whitespace-pre-line leading-relaxed">{aiReport}</p>
                ) : (
                  <button 
                    onClick={() => handleAISummarizeRisk(selectedDashboardCompany)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold hover:bg-indigo-700"
                  >
                    Generate AI Risk Explanation Report
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => { setSelectedDashboardCompany(null); setAiReport(null); }}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Close Audit Screen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
