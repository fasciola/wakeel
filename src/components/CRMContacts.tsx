import React, { useState } from 'react';
import { useDB } from '../store/DBContext';
import { Contact } from '../types';
import { dictionary } from '../store/translations';
import { Users, Search, Mail, Phone, Globe, ShieldAlert, Sparkles, Languages } from 'lucide-react';

export const CRMContacts: React.FC = () => {
  const { currentLanguage, contacts, updateContact } = useDB();
  const t = dictionary[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [search, setSearch] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase());

    const matchesNat = nationalityFilter === 'All' || c.nationality === nationalityFilter;
    const matchesStatus = statusFilter === 'All' || c.relationshipStatus === statusFilter;

    return matchesSearch && matchesNat && matchesStatus;
  });

  // Extract translation-friendly status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800';
      case 'Not Responding':
        return 'bg-red-100 text-red-800 animate-pulse';
      case 'Dispute File':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans p-2">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">{t.menuCRM}</h3>
        <p className="text-xs text-slate-500 mt-1">
          Complete register of international shareholders, phone book entries, preferred alert languages, and active responsive gaps.
        </p>
      </div>

      {/* Advanced search filter bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search partner details</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">👤</span>
            <input 
              type="text" 
              placeholder="Search name, phone, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 p-2 border border-gray-200 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nationality</label>
          <select 
            value={nationalityFilter} 
            onChange={e => setNationalityFilter(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg bg-white"
          >
            <option value="All">All Nationalities</option>
            <option value="British">British</option>
            <option value="German">German</option>
            <option value="Indian">Indian</option>
            <option value="French">French</option>
            <option value="American">American</option>
            <option value="Foreign National">Foreign National</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status index</label>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg bg-white"
          >
            <option value="All">All Gaps status</option>
            <option value="Active">Active Responsive</option>
            <option value="Not Responding">Not Responding (Escalative Warning)</option>
            <option value="Dispute File">Dispute File</option>
          </select>
        </div>
      </div>

      {/* Contacts Grid index */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {filteredContacts.map(con => (
          <div key={con.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition space-y-4">
            
            {/* Top header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-950 text-sm">{con.fullName}</h4>
                <p className="text-[11px] text-slate-500 font-sans text-right" style={{ direction: 'rtl' }}>{con.fullNameAr}</p>
                <div className="flex items-center space-x-1.5 text-[9.5px] text-gray-400 mt-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{con.nationality} | Preferred language: <strong className="text-slate-700">{con.preferredLanguage.toUpperCase()}</strong></span>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wide inline-block ${getStatusBadge(con.relationshipStatus)}`}>
                {con.relationshipStatus}
              </span>
            </div>

            {/* Email WhatsApp info */}
            <div className="space-y-1.5 text-slate-700">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-mono">{con.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-mono">{con.phone}</span>
              </div>
            </div>

            {/* Actions for changing parameters */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <button 
                onClick={() => updateContact(con.id, { 
                  relationshipStatus: con.relationshipStatus === 'Active' ? 'Not Responding' : 'Active' 
                })}
                className="px-2.5 py-1 bg-slate-50 border border-gray-150 hover:bg-slate-100 rounded text-[10px] font-bold text-slate-700 transition"
              >
                Toggle Contact Gaps
              </button>

              <button 
                onClick={() => updateContact(con.id, { 
                  preferredLanguage: con.preferredLanguage === 'en' ? 'ar' : 'en' 
                })}
                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold hover:bg-indigo-100 flex items-center space-x-0.5"
                title="Switch Preferred Language"
              >
                <Languages className="w-3.5 h-3.5 mr-1" />
                <span>Lang: {con.preferredLanguage.toUpperCase()}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
