import React, { useState } from 'react';
import { useDB } from '../store/DBContext';
import { useWorkspaceCompanies } from '../hooks/useWorkspaceCompanies';
import { Company } from '../types';
import { dictionary } from '../store/translations';
import { Search, MapPin, BadgeAlert, Coins, ShieldCheck, Filter, MoreVertical, Eye, FileSignature, Trash } from 'lucide-react';

interface CompanyListProps {
  onSelectCompany: (id: string) => void;
  onNavigate: (view: string) => void;
  workspaceId: string;
  refreshKey: number;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  onSelectCompany,
  onNavigate,
  workspaceId,
  refreshKey,
}) => {
  const { currentLanguage } = useDB();
  const { companies, loading, error, deleteCompany } = useWorkspaceCompanies(
    workspaceId,
    refreshKey,
  );
  const t = dictionary[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [search, setSearch] = useState('');
  const [emirateFilter, setEmirateFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredCompanies = companies.filter(c => {
    // Search matching
    const searchLow = search.toLowerCase();
    const matchesSearch = 
      c.legalNameEn.toLowerCase().includes(searchLow) ||
      c.legalNameAr.toLowerCase().includes(searchLow) ||
      c.tradeLicenceNumber.toLowerCase().includes(searchLow) ||
      c.businessActivity.toLowerCase().includes(searchLow);

    // Emirate filter
    const matchesEmirate = emirateFilter === 'All' || c.emirate === emirateFilter;

    // Risk levels filter
    const matchesRisk = riskFilter === 'All' || c.riskLevel === riskFilter;

    // Status filter
    const matchesStatus = statusFilter === 'All' || c.companyStatus === statusFilter;

    return matchesSearch && matchesEmirate && matchesRisk && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans p-2">
      {/* Page Header and search actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-950">{t.menuCompanies}</h3>
          <p className="text-xs text-slate-500 mt-1">Manage, filter, and inspect client companies and LSA risk score tracking parameters.</p>
        </div>
        <button 
          onClick={() => onNavigate('wizard')}
          className="px-5 py-2.5 bg-slate-900 border border-slate-950 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition flex items-center justify-center space-x-2"
        >
          <span>➕ {t.newCompanyWizardBtn}</span>
        </button>
      </div>

      {loading && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs font-semibold text-indigo-700">
          Loading companies in this workspace...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Advanced Filters Desk */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        
        {/* Search */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filter by text keyword</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400"><Search className="w-4 h-4" /></span>
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full p-2 pl-9 pr-4 border border-gray-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Emirate filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Emirate jurisdiction</label>
          <select 
            value={emirateFilter}
            onChange={e => setEmirateFilter(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="All">All Emirates ({companies.length})</option>
            {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'].map(em => (
              <option key={em} value={em}>{em}</option>
            ))}
          </select>
        </div>

        {/* Risk scores filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fiduciary Risk Rating</label>
          <select 
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="All">All Risks</option>
            <option value="Low">Low Risk (0–29)</option>
            <option value="Moderate">Moderate Risk (30–59)</option>
            <option value="High">High Risk (60–79)</option>
            <option value="Critical">Critical Risk (80–100)</option>
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Company Status</label>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="All">All statuses ({companies.length})</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Offboarding">Offboarding</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Grid count stats summary */}
      <div className="text-xs text-gray-500 flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg">
        <span>Found <strong>{filteredCompanies.length}</strong> matching companies out of {companies.length} total.</span>
        <span>Baseline Date: <strong className="font-mono">2026-06-20</strong></span>
      </div>

      {/* Desktop Tablet Table list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hidden md:block">
        <table className="w-full text-xs text-left" dir={isRtl ? 'rtl' : 'ltr'}>
          <thead className="bg-slate-50 text-slate-500 uppercase font-black border-b border-gray-100">
            <tr>
              <th className="p-4 text-center">Risk</th>
              <th className="p-4">Name & Activity</th>
              <th className="p-4">Trade License</th>
              <th className="p-4">Emirate / Legal form</th>
              <th className="p-4">LSA Agreement Fee</th>
              <th className="p-4 text-center">Expiry Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCompanies.map(c => {
              const remainsDays = Math.round((new Date(c.licenceExpiryDate).getTime() - new Date('2026-06-20').getTime()) / (1000 * 60 * 60 * 24));
              const isExpired = remainsDays < 0;

              return (
                <tr key={c.id} className="hover:bg-indigo-50/10 transition">
                  {/* Risk Badge Column */}
                  <td className="p-4 text-center">
                    <span className={`inline-block w-8 py-1.5 rounded-lg text-white font-black text-[10px] ${
                      c.riskLevel === 'Critical' ? 'bg-red-600' : c.riskLevel === 'High' ? 'bg-amber-500' : c.riskLevel === 'Moderate' ? 'bg-blue-500' : 'bg-emerald-600'
                    }`}>
                      {c.riskScore}
                    </span>
                  </td>

                  {/* Company English / Arabic names */}
                  <td className="p-4 space-y-1">
                    <span 
                      onClick={() => onSelectCompany(c.id)}
                      className="font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer block text-sm"
                    >
                      {c.legalNameEn}
                    </span>
                    <span className="text-[12px] text-slate-600 block font-medium font-sans text-right mr-auto" style={{ direction: 'rtl' }}>{c.legalNameAr}</span>
                    <span className="text-[10px] text-gray-400 block">{c.businessActivity}</span>
                  </td>

                  {/* Licence info */}
                  <td className="p-4 space-y-1">
                    <span className="font-mono text-[11px] block text-slate-800 font-bold">{c.tradeLicenceNumber}</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                      c.companyStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : c.companyStatus === 'Offboarding' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.companyStatus}
                    </span>
                  </td>

                  {/* Emirate / Legal Form */}
                  <td className="p-4 space-y-1">
                    <span className="text-slate-800 font-bold block">{c.emirate}</span>
                    <span className="text-[10px] text-gray-500 block">{c.legalForm}</span>
                  </td>

                  {/* Fee status */}
                  <td className="p-4 space-y-1">
                    <span className="font-bold text-slate-900 block">{c.annualFee.toLocaleString()} AED</span>
                    <span className="text-[9px] text-gray-400 block">{c.relationshipType}</span>
                  </td>

                  {/* Expiries indicators */}
                  <td className="p-4 text-center space-y-1">
                    <span className="font-mono text-[10px] font-bold block">{c.licenceExpiryDate}</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                      isExpired ? 'bg-red-100 text-red-700' : remainsDays <= 30 ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {isExpired ? 'Expired' : remainsDays <= 30 ? `${remainsDays} days left` : 'Valid'}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button 
                        onClick={() => onSelectCompany(c.id)}
                        className="p-1 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition"
                      >
                        Inspect Tab
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            await deleteCompany(c.id);
                          } catch (error) {
                            window.alert(
                              error instanceof Error
                                ? error.message
                                : 'Unable to archive the company.',
                            );
                          }
                        }}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                        title="Archive client"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards list */}
      <div className="grid grid-cols-1 md:hidden gap-4">
        {filteredCompanies.map(c => {
          const remainsDays = Math.round((new Date(c.licenceExpiryDate).getTime() - new Date('2026-06-20').getTime()) / (1000 * 60 * 60 * 24));
          const isExpired = remainsDays < 0;

          return (
            <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h4 
                    onClick={() => onSelectCompany(c.id)}
                    className="font-bold text-slate-900 text-sm cursor-pointer hover:text-indigo-600"
                  >
                    {c.legalNameEn}
                  </h4>
                  <p className="text-right text-xs text-slate-600 font-medium font-sans" style={{ direction: 'rtl' }}>{c.legalNameAr}</p>
                  <p className="text-[10px] text-gray-500">{c.businessActivity}</p>
                </div>
                <span className={`inline-block px-2.5 py-1 rounded text-white font-extrabold text-[10px] ${
                  c.riskLevel === 'Critical' ? 'bg-red-600' : c.riskLevel === 'High' ? 'bg-amber-500' : 'bg-indigo-500'
                }`}>
                  Score {c.riskScore}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-lg text-slate-600">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px]">Trade License</span>
                  <span className="font-mono text-slate-800 font-bold">{c.tradeLicenceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px]">Emirate Office</span>
                  <span className="text-slate-800 font-semibold">{c.emirate} ({c.legalForm})</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block uppercase font-bold text-[9px]">Sponsor Fees</span>
                  <span className="text-slate-800 font-bold">{c.annualFee.toLocaleString()} AED</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block uppercase font-bold text-[9px]">Licence Expiries</span>
                  <span className={`font-mono font-black ${isExpired ? 'text-red-600' : remainsDays <= 30 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {c.licenceExpiryDate}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  c.companyStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {c.companyStatus}
                </span>
                
                <div className="flex space-x-1.5">
                  <button 
                    onClick={() => onSelectCompany(c.id)}
                    className="p-1 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-xs transition"
                  >
                    Quick View
                  </button>
                  <button 
                    onClick={async () => {
                          try {
                            await deleteCompany(c.id);
                          } catch (error) {
                            window.alert(
                              error instanceof Error
                                ? error.message
                                : 'Unable to archive the company.',
                            );
                          }
                        }}
                    className="p-1 text-red-500 font-bold text-xs"
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
