import React, { useState } from 'react';
import { useDB } from '../store/DBContext';
import { Company, Document, Task, Invoice, ApprovalRequest, Contact, OffboardingCase, OffboardingChecklistItem } from '../types';
import { dictionary } from '../store/translations';
import { 
  Building2, ShieldAlert, FileText, FileSignature, 
  CheckSquare, Coins, Users, MessageSquare, ArrowRightLeft, 
  History, AlertTriangle, ShieldCheck, Plus, Check, Trash,
  Upload, Sparkles, Send, PhoneCall, FileDown
} from 'lucide-react';

interface CompanyDetailProps {
  companyId: string;
  onBack: () => void;
}

export const CompanyDetail: React.FC<CompanyDetailProps> = ({ companyId, onBack }) => {
  const { 
    currentLanguage, companies, updateCompany, documents, addDocument, 
    updateDocument, approvalRequests, addApprovalRequest, addApprovalDecision, 
    tasks, addTask, updateTask, deleteTask, invoices, addInvoice, 
    paymentProof, addPaymentProof, verifyPayment, contacts, companyContacts, 
    addContact, updateContact, communications, addCommunication, 
    offboardingCases, addOffboardingCase, updateOffboardingCase, 
    checklistItems, updateChecklistItem, addChecklistItem, auditLogs, 
    triggerAISolver, currentUser, payments 
  } = useDB();

  const t = dictionary[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const company = companies.find(c => c.id === companyId);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResultText, setAiResultText] = useState<string | null>(null);

  // Forms states
  const [manualRiskNote, setManualRiskNote] = useState('');
  const [newDocType, setNewDocType] = useState('Trade Licence');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('2027-06-20');
  
  const [newAppTitle, setNewAppTitle] = useState('');
  const [newAppCat, setNewAppCat] = useState('NOC');
  const [newAppRisk, setNewAppRisk] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Normal' | 'High' | 'Urgent'>('Normal');
  const [newTaskDue, setNewTaskDue] = useState('2026-07-15');

  const [newInvAmount, setNewInvAmount] = useState(15000);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const [newCommChannel, setNewCommChannel] = useState<'Email' | 'WhatsApp' | 'Call' | 'Meeting'>('Email');
  const [newCommSubject, setNewCommSubject] = useState('');
  const [newCommContent, setNewCommContent] = useState('');

  if (!company) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
        <p className="text-red-500 font-bold">Company profile file not found or has been archived.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Back to portfolio</button>
      </div>
    );
  }

  // Filtered relational child variables
  const companyDocs = documents.filter(d => d.companyId === company.id);
  const companyApps = approvalRequests.filter(a => a.companyId === company.id);
  const companyTasks = tasks.filter(task => task.companyId === company.id);
  const companyInvoices = invoices.filter(inv => inv.companyId === company.id);
  
  // Find contacts
  const associatedContactIds = companyContacts
    .filter(cc => cc.companyId === company.id)
    .map(cc => cc.contactId);
  const companyAssociatedContacts = contacts.filter(con => associatedContactIds.includes(con.id));
  const primaryContact = companyAssociatedContacts[0] || contacts[0]; // fallback to first

  const companyComms = communications.filter(c => c.companyId === company.id);
  const companyOffboarding = offboardingCases.find(o => o.companyId === company.id);
  const companyChecklist = companyOffboarding ? checklistItems.filter(chi => chi.offboardingCaseId === companyOffboarding.id) : [];
  const companyLogs = auditLogs.filter(log => log.entityId === company.id || log.entityId === companyId);

  // Tabs layout
  const tabsList = [
    { id: 'overview', icon: Building2, label: t.allTabsOverview },
    { id: 'risk', icon: ShieldAlert, label: t.allTabsRisk },
    { id: 'documents', icon: FileText, label: t.allTabsDocuments },
    { id: 'agreements', icon: FileText, label: t.allTabsAgreements },
    { id: 'approvals', icon: FileSignature, label: t.allTabsApprovals },
    { id: 'tasks', icon: CheckSquare, label: t.allTabsTasks },
    { id: 'fees', icon: Coins, label: t.allTabsInvoices },
    { id: 'contacts', icon: Users, label: t.allTabsContacts },
    { id: 'communications', icon: MessageSquare, label: t.allTabsComm },
    { id: 'offboarding', icon: ArrowRightLeft, label: t.allTabsOffboard },
    { id: 'history', icon: History, label: t.allTabsAudit },
  ];

  // Inline Handlers
  const handleSaveRiskNote = () => {
    if (!manualRiskNote) return;
    updateCompany(company.id, { notes: manualRiskNote });
    setManualRiskNote('');
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;

    addDocument({
      companyId: company.id,
      documentType: newDocType,
      title: newDocTitle,
      filePath: `/vault/w1/${company.id}/${newDocTitle.replace(/\s+/g, '_').toLowerCase()}.pdf`,
      mimeType: 'application/pdf',
      fileSize: 450,
      expiryDate: newDocExpiry,
      verificationStatus: 'Pending Review',
      uploadedBy: currentUser.id,
      notes: 'Manually loaded to Vault from inspect panel.'
    });

    setNewDocTitle('');
  };

  const handleAddSignRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppTitle) return;

    addApprovalRequest({
      companyId: company.id,
      requestTitle: newAppTitle,
      requestCategory: newAppCat,
      descriptionEn: `Requesting sponsor endorsement and signature approval for ${newAppCat}.`,
      descriptionAr: `تقديم طلب اعتماد وتوقيع وكيل الخدمات لمعاملة ${newAppCat}.`,
      requestedBy: currentUser.id,
      dueDate: '2026-07-10',
      riskLevel: newAppRisk,
      status: 'Submitted'
    });

    setNewAppTitle('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    addTask({
      companyId: company.id,
      title: newTaskTitle,
      priority: newTaskPriority,
      status: 'To Do',
      dueDate: newTaskDue,
      assigneeId: 'u2',
      createdBy: currentUser.id
    });

    setNewTaskTitle('');
  };

  const handleInvoiceGenerate = () => {
    addInvoice({
      companyId: company.id,
      invoiceNumber: `WA-${Date.now().toString().slice(-4)}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-07-20',
      currency: 'AED',
      subtotal: newInvAmount,
      vatAmount: Math.round(newInvAmount * 0.05),
      discountAmount: 0,
      totalAmount: Math.round(newInvAmount * 1.05),
      paymentStatus: 'Sent',
      createdBy: currentUser.id,
      notes: 'Dispatched manually from inspect console.'
    }, []);
  };

  const handleLogComm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommContent) return;

    addCommunication({
      companyId: company.id,
      contactId: primaryContact?.id,
      channel: newCommChannel,
      subject: newCommSubject || 'Routine Follow up details',
      content: newCommContent,
      direction: 'Outgoing',
      status: 'Sent',
      createdBy: currentUser.id
    });

    setNewCommSubject('');
    setNewCommContent('');
  };

  const handleAISummarizeDoc = async (doc: Document) => {
    setAiLoading(true);
    setAiResultText(null);
    try {
      const resp = await triggerAISolver('summarize', { companyName: company.legalNameEn, documentName: doc.title });
      setAiResultText(resp);
    } catch(e) {
      setAiResultText('Failed to query Gemini.');
    }
    setAiLoading(false);
  };

  const handleAIUnresponsive = async () => {
    setAiLoading(true);
    setAiResultText(null);
    try {
      const resp = await triggerAISolver('unresponsive_msg', { companyName: company.legalNameEn, investorName: primaryContact?.fullName || 'the Shareholder' });
      setAiResultText(resp);
    } catch(e) {
      setAiResultText('Failed to query Gemini.');
    }
    setAiLoading(false);
  };

  const handleCaseStatusToggle = (nextStatus: any) => {
    if (companyOffboarding) {
      updateOffboardingCase(companyOffboarding.id, { status: nextStatus });
    } else {
      addOffboardingCase({
        companyId: company.id,
        title: 'Formal administrative retraction file',
        reason: 'Initiated from company tabs profile.',
        status: 'Case Opened',
        riskLevel: 'Medium',
        assignedTo: currentUser.id,
        targetDate: '2026-07-20'
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans p-2">
      
      {/* Top Banner with Quick Actions and Back */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 gap-4">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="text-xs bg-slate-800 text-slate-300 hover:text-white px-2 py-1 rounded transition mb-2 inline-block"
          >
            ← Back to Companies
          </button>
          
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black">{company.legalNameEn}</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              company.riskLevel === 'Critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-indigo-600 text-white'
            }`}>
              Score {company.riskScore}
            </span>
          </div>
          <p className="text-slate-400 font-sans text-sm font-medium text-right" style={{ direction: 'rtl' }}>{company.legalNameAr}</p>
          <p className="text-xs text-slate-400">Activity: <strong className="text-slate-200">{company.businessActivity}</strong> | Trade License: <strong className="text-slate-200">{company.tradeLicenceNumber}</strong></p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button 
            onClick={() => handleCaseStatusToggle('Case Opened')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
          >
            ⚠️ {companyOffboarding ? 'Under Offboarding' : 'Retire/Withdraw Agent'}
          </button>
          <button 
            onClick={() => setActiveTab('risk')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 transition"
          >
            Risk Rules Verified
          </button>
        </div>
      </div>

      {/* Tabs navigation Scroll matrix */}
      <div className="overflow-x-auto whitespace-nowrap pb-2 flex border-b border-gray-100 gap-2">
        {tabsList.map(tab => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setAiResultText(null); }}
              className={`p-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-600 border border-gray-100'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab content container */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-2">Overview Corporate parameters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <span className="text-gray-400 block uppercase font-bold text-[9.5px]">Legal Structure form</span>
                <p className="text-sm font-bold text-slate-900">{company.legalForm}</p>
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-400 block uppercase font-bold text-[9.5px]">Jurisdiction Emirate</span>
                  <p className="text-sm font-bold text-indigo-600">{company.emirate}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <span className="text-gray-400 block uppercase font-bold text-[9.5px]">Trade License Issue date</span>
                <p className="font-mono text-sm font-bold text-slate-900">{company.licenceIssueDate}</p>
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-400 block uppercase font-bold text-[9.5px]">Trade License Expiry Date</span>
                  <p className="font-mono text-sm font-bold text-rose-600">{company.licenceExpiryDate}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <span className="text-gray-400 block uppercase font-bold text-[9.5px]">Sponsorship Active Type</span>
                <p className="text-sm font-bold text-slate-900 text-emerald-700">{company.relationshipType}</p>
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-400 block uppercase font-bold text-[9.5px]">Annual Sponsorship agreement fee</span>
                  <p className="text-sm font-extrabold text-slate-900">{company.annualFee.toLocaleString()} AED / Year</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs space-y-2 text-indigo-950">
              <span className="font-bold block">⚖️ UAE Service Agent Legislation note:</span>
              <p className="leading-relaxed">
                As per UAE Federal Decree-Law No. 32 of 2021 on Commercial Companies, the local partner percentage or Local Service Agent (LSA) requirements act on administrative, representation frameworks. Our platform stores agreement proofs and expiries to ensure total defense in contract disputes.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: RISK ENGINE */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-slate-900">Configured Risk Score Explanation Analysis</h3>
              <span className="bg-slate-950 text-white px-2 py-0.5 rounded font-mono text-[10px]">Rules Engine v1.0</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-bold">Risk Assessment Matrix:</span>
                <p className="text-sm font-black mt-1 text-slate-800">This file has score rating {company.riskScore} / 100 ({company.riskLevel} Case)</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-white font-black text-sm ${
                company.riskLevel === 'Critical' ? 'bg-red-600' : 'bg-indigo-600'
              }`}>
                {company.riskLevel}
              </span>
            </div>

            {/* Configured reasons bullet logic */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-semibold uppercase text-slate-500">Why did these risk points trigger?</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {company.riskScore >= 35 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <strong>⚠️ License Expired (+35 Points)</strong>
                    <p className="text-[10px] text-red-600 mt-1">Official Trade License expiry date has passed. Immense risk of municipality lock and labour portal freezing.</p>
                  </div>
                )}
                
                {companyOffboarding && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                    <strong>⚠️ Exit Case In Preparation (+15 Points)</strong>
                    <p className="text-[10px] mt-1">LSA retraction file has been opened. Compliance steps pending validation before official detachment.</p>
                  </div>
                )}

                {primaryContact && primaryContact.relationshipStatus === 'Not Responding' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                    <strong>⚠️ Unresponsive Partner (+10 Points)</strong>
                    <p className="text-[10px] mt-1">Active communication gaps exceeding 14 calendar days. Critical sign loop bottleneck risk.</p>
                  </div>
                )}

                {companyDocs.length < 2 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                    <strong>⚠️ Incomplete Document Dossier (+10 Points)</strong>
                    <p className="text-[10px] mt-1">Mandatory Trade License and Local Service Agent Agreement copies missing in central vault.</p>
                  </div>
                )}

                {company.notes && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-800 col-span-1 md:col-span-2">
                    <strong>⚠️ Agent Manual Risk Flag Noted (+20 Points)</strong>
                    <blockquote className="text-[11px] font-mono italic my-1">"{company.notes}"</blockquote>
                  </div>
                )}
              </div>
            </div>

            {/* Manual note writing */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
              <label className="block font-bold text-slate-500 uppercase">Override Manual LSA Risk Note / Dispute Notice</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Landlord reported office tenancy default. Escalate PRO tracking."
                  value={manualRiskNote}
                  onChange={e => setManualRiskNote(e.target.value)}
                  className="flex-1 p-2 border border-gray-200 rounded-lg"
                />
                <button 
                  onClick={handleSaveRiskNote}
                  className="px-4 py-2 bg-slate-900 border border-slate-950 text-white font-bold rounded-lg"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DOCUMENTS VAULT */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-2">Document Vault - Local Storage</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Docs listing */}
              <div className="lg:col-span-2 space-y-3 text-xs">
                {companyDocs.map(doc => (
                  <div key={doc.id} className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl transition border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-indigo-100 rounded-lg text-indigo-700">📄</div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{doc.title}</span>
                        <span className="text-[10px] text-gray-500 block">Class: {doc.documentType} | Version: v{doc.versionNumber} | Size: {doc.fileSize} KB</span>
                        {doc.expiryDate && (
                          <span className="text-[10px] text-gray-400 block">Expiry: <strong className="text-slate-700">{doc.expiryDate}</strong></span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        doc.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.verificationStatus}
                      </span>
                      
                      {/* AI Action */}
                      <button 
                        onClick={() => handleAISummarizeDoc(doc)}
                        className="p-1 px-2.5 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 text-[10px]"
                      >
                        AI Summarize
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload simulation */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-200">
                <form onSubmit={handleUploadDoc} className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 mb-2">Simulate Document Upload</h4>
                  
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Document Class Type</label>
                    <select 
                      value={newDocType} 
                      onChange={e => setNewDocType(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white bg-white"
                    >
                      <option value="Trade Licence">Trade Licence</option>
                      <option value="Local Service Agent Agreement">LSA Agreement</option>
                      <option value="Memorandum of Association">Memorandum of Association</option>
                      <option value="Tenancy Contract">Tenancy Contract</option>
                      <option value="Passport Copy">Passport Copy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Upload Label Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ejari Rent Invoice 2026-2027"
                      value={newDocTitle}
                      onChange={e => setNewDocTitle(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Official expiration date</label>
                    <input 
                      type="date"
                      value={newDocExpiry}
                      onChange={e => setNewDocExpiry(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-xs"
                  >
                    Upload mock document PDF
                  </button>
                </form>
              </div>
            </div>

            {/* AI Result Box */}
            {aiResultText && (
              <div className="p-4 bg-indigo-950 text-white rounded-xl text-xs space-y-2 relative">
                <button onClick={() => setAiResultText(null)} className="absolute right-3 top-2 text-slate-300 hover:text-white">✕</button>
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-extrabold">Wakeel AI Document Analysis Results:</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed">{aiResultText}</p>
              </div>
            )}
            {aiLoading && (
              <div className="p-4 bg-slate-900 text-slate-300 rounded-xl text-xs animate-pulse text-center">
                🧠 Wakeel AI analyzer running severe background checks on document parameters...
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AGREEMENTS TERMS */}
        {activeTab === 'agreements' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-2">Local Service Agent Legal Terms</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <span className="text-gray-400 block uppercase font-black text-[9.5px]">Representative Type</span>
                <p className="text-sm font-bold text-slate-900">{company.relationshipType}</p>
                <p className="text-gray-500 leading-relaxed text-[11px]">
                  Under terms, the agent does not participate in active operational profits or incur core liabilities unless explicitly signing joint declarations.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <span className="text-gray-400 block uppercase font-black text-[9.5px]">Fees & Schedule</span>
                <p className="text-sm font-extrabold text-slate-900">{company.annualFee.toLocaleString()} AED / Year</p>
                <p className="text-gray-500 leading-relaxed text-[11px]">
                  Fiduciary fees are collected annually on license initiation dates. Unpaid periods exceeding 30 calendar days trigger compliance notices.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: APPROVALS & SIGNATURES */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-2">Active Signature & Digital approval records</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Requests lists */}
              <div className="lg:col-span-2 space-y-3 text-xs">
                {companyApps.map(req => (
                  <div key={req.id} className="p-4 bg-slate-50 border border-gray-100 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-950 block text-xs">{req.requestTitle}</span>
                      <span className="text-[10px] text-gray-500 block">Category: {req.requestCategory} | Urgent: {req.riskLevel}</span>
                      <p className="text-[10px] text-indigo-700 italic mt-1 font-mono">Status: {req.status}</p>
                    </div>

                    <div className="flex space-x-1.5">
                      {req.status === 'Submitted' && (
                        <button 
                          onClick={() => {
                            addApprovalDecision({
                              approvalRequestId: req.id,
                              approverId: currentUser.id,
                              decision: 'Approve',
                              authenticationMethod: 'IP and Passcode Recorded',
                              ipAddress: '194.170.16.2',
                              deviceInfo: 'LSA Dashboard console'
                            });
                          }}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700"
                        >
                          ✓ Approves Sign
                        </button>
                      )}
                      
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block ${
                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add form */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-200">
                <form onSubmit={handleAddSignRequest} className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 mb-2">Issue Digital Sign Request</h4>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Request Class Category</label>
                    <select 
                      value={newAppCat} 
                      onChange={e => setNewAppCat(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white bg-white"
                    >
                      <option value="NOC">NOC Template Signatory</option>
                      <option value="Trade licence amendment">Trade Licence Amendment</option>
                      <option value="Visa-related request">Worker Quota Visa signs</option>
                      <option value="Establishment card">Establishment cards signature</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Title details</label>
                    <input 
                      type="text" 
                      placeholder="e.g. NOC to open alternative Emirates NBD bank branch"
                      value={newAppTitle}
                      onChange={e => setNewAppTitle(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
                  >
                    Submit Signature Request
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: TASKS LIST */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-2">Compliance Action Tasks</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Tasks lists */}
              <div className="lg:col-span-2 space-y-2.5 text-xs">
                {companyTasks.map(task => (
                  <div key={task.id} className="p-3 bg-slate-50 hover:bg-slate-100/50 rounded-xl transition border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => updateTask(task.id, { status: task.status === 'Completed' ? 'To Do' : 'Completed' })}
                        className={`w-4 h-4 rounded border flex items-center justify-center font-bold text-[9px] ${
                          task.status === 'Completed' ? 'bg-indigo-600 text-white' : 'border-gray-300'
                        }`}
                      >
                        {task.status === 'Completed' && '✓'}
                      </button>
                      
                      <div>
                        <span className={`font-bold block ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-slate-900'}`}>
                          {task.title}
                        </span>
                        <span className="text-[9.5px] text-gray-400 block">Due date: {task.dueDate} | Priority: {task.priority}</span>
                      </div>
                    </div>

                    <button onClick={() => deleteTask(task.id)} className="text-red-500 font-bold hover:text-red-700">Delete</button>
                  </div>
                ))}
              </div>

              {/* Add form */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-200">
                <form onSubmit={handleAddTask} className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 mb-2">Schedule task</h4>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Task description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Verify VAT filing code registry"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Priority</label>
                      <select 
                        value={newTaskPriority} 
                        onChange={e => setNewTaskPriority(e.target.value as any)}
                        className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                      >
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Due Date</label>
                      <input 
                        type="date" 
                        value={newTaskDue} 
                        onChange={e => setNewTaskDue(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
                  >
                    Schedule Task
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB 7: FEES & INVOICES */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-slate-900">Annual fees & PRO Service ledger</h3>
              <button 
                onClick={handleInvoiceGenerate}
                className="px-3 py-1.5 bg-indigo-600 text-white text-[10.5px] font-bold rounded-md hover:bg-indigo-700 transition"
              >
                Raise New LSA Invoice [AED {company.annualFee}]
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {companyInvoices.map(inv => {
                const invoicePayment = payments.find(p => p.invoiceId === inv.id);
                return (
                  <div key={inv.id} className="p-4 bg-slate-50 border border-gray-100 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-slate-800 block text-xs">{inv.invoiceNumber}</span>
                      <span className="text-[10px] text-gray-500 block">Raised Date: {inv.invoiceDate} | Due Date: {inv.dueDate}</span>
                      <p className="font-extrabold text-slate-900 mt-1 text-sm">{inv.totalAmount.toLocaleString()} AED</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${
                        inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {inv.paymentStatus}
                      </span>

                      {inv.paymentStatus === 'Overdue' && (
                        <button 
                          onClick={() => {
                            addPaymentProof(
                              inv.id,
                              inv.totalAmount,
                              'Bank Transfer',
                              {
                                title: `Bank Payment Slip - ${inv.invoiceNumber}`,
                                documentType: 'Payment slip receipt',
                                filePath: `/vault/w1/${company.id}/rec_${inv.invoiceNumber}.pdf`,
                                mimeType: 'application/pdf',
                                fileSize: 320,
                                verificationStatus: 'Pending Review',
                                uploadedBy: 'u_investor'
                              }
                            );
                          }}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded text-[10px] font-bold hover:bg-slate-800"
                        >
                          Record Client Receipt
                        </button>
                      )}

                      {/* Staff verify */}
                      {inv.paymentStatus === 'Partially Paid' && (
                        <button 
                          onClick={() => {
                            // Find mock payment
                            const pm = payments.find(p => p.invoiceId === inv.id);
                            if (pm) verifyPayment(pm.id, true);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 animate-pulse"
                        >
                          Verify Transfer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 8: CONTACTS CRM */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-2">CRM Primary investor contact card</h3>

            {primaryContact ? (
              <div className="p-5 bg-slate-50 border border-gray-100 rounded-xl text-xs space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9.5px] uppercase font-black tracking-widest text-slate-400 block">Investor Profile</span>
                    <h4 className="text-sm font-black text-slate-950">{primaryContact.fullName}</h4>
                    <p className="text-[11px] text-slate-500 font-sans text-right" style={{ direction: 'rtl' }}>{primaryContact.fullNameAr}</p>
                    <p className="text-slate-600 text-[11px]">Nationality: <strong className="text-slate-800">{primaryContact.nationality}</strong> | Main Language: {primaryContact.preferredLanguage}</p>
                  </div>
                  
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                    primaryContact.relationshipStatus === 'Not Responding' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {primaryContact.relationshipStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-3">
                  <div>
                    <span className="text-gray-400 block font-bold text-[9px] uppercase">Email coordinates</span>
                    <p className="text-slate-800 font-semibold">{primaryContact.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-bold text-[9px] uppercase">WhatsApp contact line</span>
                    <p className="text-slate-800 font-semibold">{primaryContact.phone}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No registered primary investor contact found. Use CRMs module to map contact.</p>
            )}
          </div>
        )}

        {/* TAB 9: COMMUNICATIONS */}
        {activeTab === 'communications' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-2">Administrative dispatch logs</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Comms history */}
              <div className="lg:col-span-2 space-y-3.5 text-xs max-h-[350px] overflow-y-auto pr-1">
                {companyComms.length > 0 ? (
                  companyComms.map(c => (
                    <div key={c.id} className="p-3 bg-slate-50 border border-gray-100 rounded-lg space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-extrabold uppercase text-indigo-600">{c.channel} ({c.direction})</span>
                        <span>{new Date(c.sentAt).toLocaleTimeString()}</span>
                      </div>
                      <span className="font-bold text-slate-900 block">{c.subject}</span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{c.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No formal telecommunication/warning notice logs created yet.</p>
                )}
              </div>

              {/* Form dispatch */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-200">
                <form onSubmit={handleLogComm} className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 mb-2">Dispatch/Record outreach</h4>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Outreach Class channel</label>
                    <select 
                      value={newCommChannel} 
                      onChange={e => setNewCommChannel(e.target.value as any)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="Email">Official email notification</option>
                      <option value="WhatsApp">Automated WhatsApp alert</option>
                      <option value="Call">Log telephonic conversation</option>
                      <option value="Meeting">Register in-person workshop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Subject brief</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Expiry warnings citation"
                      value={newCommSubject}
                      onChange={e => setNewCommSubject(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">Brief Content</label>
                    <textarea 
                      placeholder="Type details..."
                      rows={3}
                      value={newCommContent}
                      onChange={e => setNewCommContent(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
                  >
                    Dispatch Outreach Log
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB 10: OFFBOARDING / EXIT */}
        {activeTab === 'offboarding' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-slate-900">Diligence Exit & Handover records</h3>
              
              <button 
                onClick={handleAIUnresponsive}
                className="px-2 py-1 bg-indigo-950 text-indigo-400 border border-indigo-900 text-[10px] font-bold rounded hover:bg-slate-900 flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Draft Escalation Notice</span>
              </button>
            </div>

            {companyOffboarding ? (
              <div className="space-y-6 text-xs">
                {/* Visual stage header */}
                <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Workflow Active Stage:</span>
                    <span className="text-indigo-600 font-extrabold uppercase">{companyOffboarding.status}</span>
                  </div>
                  
                  {/* Visual Stage Progress line */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-indigo-600" style={{ width: '55%' }}></div>
                  </div>
                </div>

                {/* Checklist detail validation */}
                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-slate-500">Sponsor Protection Diligence Checklist</h4>
                  
                  <div className="space-y-2">
                    {companyChecklist.map(chi => (
                      <div key={chi.id} className="p-2.5 bg-slate-50 border border-gray-100 hover:bg-slate-100 text-[11px] rounded-lg flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => updateChecklistItem(chi.id, { status: chi.status === 'Completed' ? 'Pending' : 'Completed' })}
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-bold text-[9px] ${
                              chi.status === 'Completed' ? 'bg-indigo-600 text-white' : 'border-gray-200 bg-white'
                            }`}
                          >
                            {chi.status === 'Completed' && '✓'}
                          </button>
                          <span className={chi.status === 'Completed' ? 'line-through text-gray-400' : 'text-slate-900 font-semibold'}>{chi.title}</span>
                        </div>
                        
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          chi.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {chi.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Export Report Action */}
                  <div className="pt-4 border-t border-gray-100 text-right">
                    <button 
                      onClick={async () => {
                        setAiLoading(true);
                        setAiResultText(null);
                        try {
                          const resp = await triggerAISolver('offboard_report', { companyName: company.legalNameEn, caseId: companyOffboarding.id, caseTitle: companyOffboarding.title });
                          setAiResultText(resp);
                        } catch(e) {
                          setAiResultText('Failed to compile offboarding documentation dossier.');
                        }
                        setAiLoading(false);
                      }}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition text-xs flex items-center space-x-1.5 ml-auto"
                    >
                      <FileDown className="w-4 h-4 text-slate-400" />
                      <span>{t.exportReportBtn}</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl space-y-3">
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  No active exit, liquidation, or Local Service Agent retraction/replacement case exists for this company. All sponsorship protections are currently aligned.
                </p>
                <button 
                  onClick={() => handleCaseStatusToggle('Case Opened')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
                >
                  🚀 Open Handover / Retraction File
                </button>
              </div>
            )}

            {/* AI Result overlay context */}
            {aiResultText &&
              <div className="p-4 bg-indigo-950 text-white rounded-xl text-xs space-y-2 relative animate-fade-in">
                <button onClick={() => setAiResultText(null)} className="absolute right-3 top-2 text-slate-300 hover:text-white">✕</button>
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  <span className="font-extrabold">Wakeel AI Generative Report:</span>
                </div>
                <div className="bg-indigo-900/40 p-4 rounded-lg font-mono text-[11px] whitespace-pre-line leading-relaxed shadow-inner">
                  {aiResultText}
                </div>
              </div>
            }
            {aiLoading &&
              <div className="p-4 bg-slate-900 text-slate-300 rounded-xl text-xs animate-pulse text-center">
                🧠 Compiling administrative timelines and security rules logs directly via Wakeel AI secure servers...
              </div>
            }
          </div>
        )}

        {/* TAB 11: AUDIT ACTIVITY LOG */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-2">Immutable Administrative History</h3>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {companyLogs.length > 0 ? (
                companyLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                      <span>IP: {log.ipAddress} | {log.userAgent.slice(0, 30)}...</span>
                      <span>{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <span className="font-bold text-slate-900">{log.userName} (Role: LSA Workspace)</span>
                    <p className="text-slate-600 font-semibold">{log.action}</p>
                    {log.newValueJson && (
                      <pre className="p-2 bg-gray-900/5 text-slate-700 text-[10px] font-mono rounded max-h-[80px] overflow-y-auto mt-2">
                        {log.newValueJson}
                      </pre>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No formal system logs associated with this company container yet.</p>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
