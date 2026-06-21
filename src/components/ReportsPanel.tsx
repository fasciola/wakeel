import React, { useState } from 'react';
import { useDB } from '../store/DBContext';
import { dictionary } from '../store/translations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Calendar, ShieldCheck, Download, AlertCircle } from 'lucide-react';

export const ReportsPanel: React.FC = () => {
  const { currentLanguage, companies, documents } = useDB();
  const t = dictionary[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [dateRange, setDateRange] = useState('30_days');

  // Group expiries
  const criticalExpiries = companies.filter(c => {
    const remains = Math.round((new Date(c.licenceExpiryDate).getTime() - new Date('2026-06-20').getTime()) / (1000 * 60 * 60 * 24));
    return remains <= 30;
  });

  const soonExpiries = companies.filter(c => {
    const remains = Math.round((new Date(c.licenceExpiryDate).getTime() - new Date('2026-06-20').getTime()) / (1000 * 60 * 60 * 24));
    return remains > 30 && remains <= 90;
  });

  const chartData = [
    { name: 'Under 30 days', count: criticalExpiries.length, fill: '#ef4444' },
    { name: '31–90 Days', count: soonExpiries.length, fill: '#f59e0b' },
    { name: 'Fully Compliant', count: companies.length - (criticalExpiries.length + soonExpiries.length), fill: '#10b981' }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans p-2">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">{t.menuReports}</h3>
        <p className="text-xs text-slate-500 mt-1">
          Exportable regulatory reports, unified calendar expiries metrics, and compliance logs archives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        
        {/* Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-950 text-sm">Regulatory Expiries Distribution</h4>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action downloads */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-950 text-sm">Export Protection Dossiers</h4>
          
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">All Files Audit Summary CSV</span>
                <span className="text-[10px] text-gray-500 block">Size: 45 KB | Type: spreadsheet</span>
              </div>
              <button className="p-1 px-2.5 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 text-[10px]">
                Export
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 block">Overdue Sponsor Fee dossiers</span>
                <span className="text-[10px] text-gray-500 block">Size: 120 KB | Type: PDF binder</span>
              </div>
              <button className="p-1 px-2.5 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 text-[10px]">
                Export
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
