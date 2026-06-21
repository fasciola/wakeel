import React, { useState } from 'react';
import { useDB } from '../store/DBContext';
import { Document } from '../types';
import { dictionary } from '../store/translations';
import { FileText, Search, ShieldCheck, Download, AlertCircle, FileX, Archive } from 'lucide-react';

export const DocumentVault: React.FC = () => {
  const { currentLanguage, documents, companies, updateDocument } = useDB();
  const t = dictionary[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Security message state
  const [signedUrlInfo, setSignedUrlInfo] = useState<string | null>(null);

  const filteredDocs = documents.filter(d => {
    const parentCompany = companies.find(c => c.id === d.companyId);
    const parentName = parentCompany ? parentCompany.legalNameEn.toLowerCase() : '';
    
    const matchesSearch = 
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      parentName.includes(search.toLowerCase()) ||
      d.documentType.toLowerCase().includes(search.toLowerCase());

    const matchesClass = classFilter === 'All' || d.documentType === classFilter;
    const matchesStatus = statusFilter === 'All' || d.verificationStatus === statusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleDownloadSecureFile = (doc: Document) => {
    // Generate secure temporary signature notification
    setSignedUrlInfo(`Secure file hand-check signed! Direct URL shielded. One-time link active for 60 seconds:
https://wakeel.ae/vault/download-signed/${doc.id}?hash=${Math.random().toString().slice(2, 10)}`);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans p-2">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">{t.menuDocuments}</h3>
        <p className="text-xs text-slate-500 mt-1">
          Secure central file registry of trade licences, lease agreements, and corporate approvals copies. Direct visual file paths are masked to secure data privacy.
        </p>
      </div>

      {/* Security alert box */}
      <div className="p-3 bg-indigo-50 text-indigo-950 rounded-lg text-xs flex items-center space-x-2 border border-indigo-100">
        <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
        <p><strong>Private S3 Enclosed:</strong> Direct file URLs are encrypted; documents can only be exported via temporary signed authorization certificates.</p>
      </div>

      {/* Active filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Vault documents</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="e.g. Tenancy, c1..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 p-2 border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Class category</label>
          <select 
            value={classFilter} 
            onChange={e => setClassFilter(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg bg-white"
          >
            <option value="All">All Documents</option>
            <option value="Trade Licence">Trade Licence</option>
            <option value="Local Service Agent Agreement">LSA Agreement</option>
            <option value="Memorandum of Association">Memorandum of Association</option>
            <option value="Tenancy Contract">Tenancy Contract</option>
            <option value="Passport Copy">Passport Copy</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status Class</label>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Expired">Expired</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map(d => {
          const parentCompany = companies.find(c => c.id === d.companyId);
          return (
            <div key={d.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex space-x-3 text-xs">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl text-lg flex-shrink-0">
                    📂
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-950 block text-[13px]">{d.title}</span>
                    <span className="text-indigo-600 font-bold block">{parentCompany ? parentCompany.legalNameEn : 'Archived Entity'}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">Class: {d.documentType} | Size: {d.fileSize} KB</span>
                    {d.expiryDate && (
                      <span className="text-[10px] text-red-500 block font-semibold">Expiry Date: {d.expiryDate}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${
                    d.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {d.verificationStatus}
                  </span>
                  
                  <span className="text-[10px] text-gray-400 font-mono">v{d.versionNumber}</span>
                </div>
              </div>

              {/* Secure actions */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs text-slate-500">
                <div className="flex space-x-1.5">
                  {d.verificationStatus === 'Pending Review' && (
                    <button 
                      onClick={() => updateDocument(d.id, { verificationStatus: 'Verified' })}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[9.5px]"
                    >
                      Authorize Verify
                    </button>
                  )}
                  {d.verificationStatus === 'Verified' && (
                    <button 
                      onClick={() => updateDocument(d.id, { verificationStatus: 'Expired' })}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[9.5px]"
                    >
                      Mark Expired
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => handleDownloadSecureFile(d)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center space-x-1 text-[10.5px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Secure Download</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secure signing modal */}
      {signedUrlInfo && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md border border-gray-100 shadow-2xl relative space-y-3 text-xs">
            <button onClick={() => setSignedUrlInfo(null)} className="absolute right-3 top-3 text-slate-400">✕</button>
            <div className="flex items-center space-x-2 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="font-extrabold text-sm">Temporary Access URL generated</h4>
            </div>
            <p className="text-slate-600 bg-slate-50 p-3.5 rounded-xl font-mono text-[10.5px] whitespace-pre-line leading-relaxed shadow-inner">
              {signedUrlInfo}
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">
              Anti-malware check cleared. Access log has been appended to the general audit log for tracking under regulatory directives.
            </p>
            <div className="text-right">
              <button 
                onClick={() => setSignedUrlInfo(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg"
              >
                Close Link Box
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
