import React, { useState } from 'react';
import { DBProvider, useDB } from './store/DBContext';
import { dictionary } from './store/translations';
import { Dashboard } from './components/Dashboard';
import { CompanyList } from './components/CompanyList';
import { CompanyDetail } from './components/CompanyDetail';
import { AddCompanyWizard } from './components/AddCompanyWizard';
import { DocumentVault } from './components/DocumentVault';
import { SignatureCenter } from './components/SignatureCenter';
import { InvoiceHub } from './components/InvoiceHub';
import { OffboardingWorkflow } from './components/OffboardingWorkflow';
import { CRMContacts } from './components/CRMContacts';
import { TasksList } from './components/TasksList';
import { ReportsPanel } from './components/ReportsPanel';
import { AuthGate } from './components/AuthGate';
import { logoutUser } from './lib/auth';
import { 
  Building2, ShieldAlert, FileText, FileSignature, 
  Wallet, CalendarClock, MailWarning, LayoutDashboard,
  Users, CheckSquare, ClipboardList, LogOut, Menu, X, Globe, UserCheck
} from 'lucide-react';

function AppContent({ authProps }: { authProps: any }) {
  const { currentLanguage, setLanguage, currentUser, setCurrentRole } = useDB();
  const t = dictionary[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  // Navigation states
  const [activeView, setActiveView] = useState<string>('overview');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Switch views beautifully
  const handleNavigate = (view: string, selectedId?: string) => {
    setMobileMenuOpen(false);
    setSelectedCompanyId(null);
    if (view === 'wizard') {
      setWizardOpen(true);
      return;
    }
    if (selectedId) {
      setSelectedCompanyId(selectedId);
      setActiveView('company_details');
    } else {
      setActiveView(view);
    }
  };

  const handleSelectCompany = (id: string) => {
    setSelectedCompanyId(id);
    setActiveView('company_details');
  };

  // Sidebar list matching our spec
  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: t.menuOverview },
    { id: 'companies', icon: Building2, label: t.menuCompanies },
    { id: 'documents', icon: FileText, label: t.menuDocuments },
    { id: 'approvals', icon: FileSignature, label: t.menuApprovals },
    { id: 'invoices', icon: Wallet, label: t.menuInvoices },
    { id: 'tasks', icon: CheckSquare, label: t.menuTasks },
    { id: 'offboarding', icon: ClipboardList, label: t.menuOffboarding },
    { id: 'crm', icon: Users, label: t.menuCRM },
    { id: 'reports', icon: CalendarClock, label: t.menuReports },
  ];

  return (
    <div 
      className="min-h-screen bg-[#F1F5F9] flex flex-col md:flex-row text-slate-800 font-sans font-medium" 
      dir={isRtl ? 'rtl' : 'ltr'} 
      id="applet_canvas_root"
    >
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#0F172A] text-white p-4 flex justify-between items-center z-40 border-b border-[#1E293B]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white text-base">🛡️</span>
          </div>
          <div className={isRtl ? 'mr-2' : 'ml-1'}>
            <h1 className="text-sm font-bold tracking-tight text-[#F8FAFC]">{t.appName}</h1>
            <span className="text-[9px] text-[#818CF8] block tracking-wider uppercase font-semibold">{t.appSubtitle}</span>
          </div>
        </div>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Primary Sidebar - Desktop */}
      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-[#0F172A] text-white flex flex-col z-30 transition-transform duration-300 transform border-r border-[#1E293B] ${
        mobileMenuOpen ? 'translate-x-0' : isRtl ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${isRtl ? 'right-0' : 'left-0'} md:block flex-shrink-0`}>
        
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1E293B] flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white text-sm">🛡️</span>
          </div>
          <div className={isRtl ? 'mr-3' : 'ml-1'}>
            <h1 className="text-[14px] font-bold tracking-tight text-[#F8FAFC]">{t.appName}</h1>
            <span className="text-[9.5px] text-[#818CF8] block tracking-wider uppercase font-semibold">{t.appSubtitle}</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const IconComp = item.icon;
            const isActive = activeView === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full p-2.5 px-4 rounded-lg text-xs font-semibold flex items-center transition duration-150 ${
                  isActive 
                    ? 'bg-[#1E293B] text-[#818CF8] shadow-sm' 
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/65'
                }`}
              >
                <IconComp className="w-4 h-4 flex-shrink-0" />
                <span className={isRtl ? 'mr-3' : 'ml-3'}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Global Controls: Languages, Roles */}
        <div className="p-4 border-t border-[#1E293B] space-y-3 bg-[#0F172A]/90 text-xs">
          {/* Role selector switcher */}
          <div className="space-y-1">
            <span className="text-[9px] text-[#64748B] uppercase font-bold block">{t.roleLabel}</span>
            <select 
              value={currentUser.role}
              onChange={e => {
                const target = e.target.value;
                if (target === 'Owner') setCurrentRole('workspace_owner');
                if (target === 'Staff') setCurrentRole('staff_representative');
              }}
              className="w-full p-1.5 bg-[#1E293B] border border-[#334155] rounded-md text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
            >
              <option value="Owner">Faisal Al Mansoori ({isRtl ? 'المالك' : 'Owner'})</option>
              <option value="Staff">Zayed ({isRtl ? 'علاقات عامة' : 'Staff PRO Liaison'})</option>
            </select>
          </div>

          {/* Bilingual Language Switcher */}
          <button 
            onClick={() => setLanguage(currentLanguage === 'en' ? 'ar' : 'en')}
            className="w-full py-2 bg-[#1E293B] border border-[#334155] text-slate-200 font-bold rounded-lg hover:bg-slate-800 transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#818CF8]" />
            <span>{t.languageSwitchLabel}</span>
          </button>

          {/* Log Out option */}
          <button 
            onClick={async () => {
              await logoutUser();
              authProps.onLogout();
              window.location.reload();
            }}
            className="w-full py-2 bg-rose-950/30 border border-rose-900/50 text-rose-300 font-bold rounded-lg hover:bg-rose-900/40 transition flex items-center justify-center space-x-1.5 cursor-pointer text-[11px]"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>{isRtl ? 'تسجيل الخروج الآمن' : 'Fiduciary Logout'}</span>
          </button>
          
          <div className="text-[9px] text-[#64748B] text-center font-mono">
            <span>Node: Al-Mansoori-Escrow-1</span>
          </div>
        </div>

      </aside>

      {/* Main Container Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Workspace banner / quick details */}
        <header className="bg-white border-b border-[#E2E8F0] h-[72px] px-8 hidden md:flex items-center justify-between shadow-xs">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
              {isRtl ? authProps.workspace.name_ar : authProps.workspace.name_en}
            </h2>
            <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5 tracking-wider">
              {isRtl ? 'وكيل خدمات محلات رخص تجارية وعلاقات مستثمرين معتمد' : 'Authorized Local Service Agent Escrow Workspace'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="bg-[#DCFCE7] text-[#166534] px-3 py-1 rounded-full font-extrabold flex items-center space-x-1.5 border border-[#BBF7D0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] inline-block animate-pulse"></span>
              <span>Regulatory Shield Live</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">UTC: 2026-06-21</span>
          </div>
        </header>

        {/* View render hub */}
        <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {activeView === 'overview' && <Dashboard onNavigate={handleNavigate} />}
          {activeView === 'companies' && <CompanyList onSelectCompany={handleSelectCompany} onNavigate={handleNavigate} />}
          {activeView === 'company_details' && selectedCompanyId && (
            <CompanyDetail companyId={selectedCompanyId} onBack={() => setActiveView('companies')} />
          )}
          {activeView === 'documents' && <DocumentVault />}
          {activeView === 'approvals' && <SignatureCenter />}
          {activeView === 'invoices' && <InvoiceHub />}
          {activeView === 'tasks' && <TasksList />}
          {activeView === 'offboarding' && <OffboardingWorkflow />}
          {activeView === 'crm' && <CRMContacts />}
          {activeView === 'reports' && <ReportsPanel />}
        </div>

      </main>

      {/* Guided enrollment Wizard Overlay */}
      {wizardOpen && (
        <AddCompanyWizard 
          onClose={() => setWizardOpen(false)}
          onSuccess={() => {
            setWizardOpen(false);
            setActiveView('companies');
          }}
        />
      )}

    </div>
  );
}

function InnerWrap() {
  const { currentLanguage, setLanguage } = useDB();
  return (
    <AuthGate currentLanguage={currentLanguage} setLanguage={setLanguage}>
      {(authProps) => <AppContent authProps={authProps} />}
    </AuthGate>
  );
}

export default function App() {
  return (
    <DBProvider>
      <InnerWrap />
    </DBProvider>
  );
}

