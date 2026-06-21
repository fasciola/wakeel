import React, { useState } from 'react';
import { useDB } from '../store/DBContext';
import { Invoice } from '../types';
import { dictionary } from '../store/translations';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Coins, Wallet, Clock, CheckCircle, ShieldAlert, FileText, Send, Check } from 'lucide-react';

export const InvoiceHub: React.FC = () => {
  const { currentLanguage, invoices, companies, addInvoice, addPaymentProof, verifyPayment, payments } = useDB();
  const t = dictionary[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [newInvAmount, setNewInvAmount] = useState<number>(10000);
  const [newInvCompanyId, setNewInvCompanyId] = useState<string>(companies[0]?.id || '');
  const [newInvNum, setNewInvNum] = useState<string>(`WA-INV-${Math.round(Math.random() * 900 + 100)}`);

  // Calculations
  const totalRaised = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.filter(i => i.paymentStatus === 'Paid').reduce((sum, i) => sum + i.totalAmount, 0);
  const totalOverdue = invoices.filter(i => i.paymentStatus === 'Overdue' || i.paymentStatus === 'Sent').reduce((sum, i) => sum + i.totalAmount, 0);

  // Recharts Chart Structure 1: Sales / Invoice status overview
  const financeData = [
    { name: 'Collected Fees', value: totalPaid, fill: '#10b981' },
    { name: 'Due Metrices', value: totalOverdue, fill: '#ef4444' }
  ];

  // Recharts Chart Structure 2: Emirate revenue spreads
  const emirateFeeData = companies.reduce((acc: any[], company) => {
    const existing = acc.find(item => item.name === company.emirate);
    if (existing) {
      existing.value += company.annualFee;
    } else {
      acc.push({ name: company.emirate, value: company.annualFee });
    }
    return acc;
  }, []);

  const handleCreateNewInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvCompanyId) return;

    addInvoice({
      companyId: newInvCompanyId,
      invoiceNumber: newInvNum,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'AED',
      subtotal: Number(newInvAmount),
      vatAmount: Math.round(Number(newInvAmount) * 0.05),
      discountAmount: 0,
      totalAmount: Math.round(Number(newInvAmount) * 1.05),
      paymentStatus: 'Sent',
      createdBy: 'u1',
      notes: 'Generated via service finance terminal.'
    }, []);

    setNewInvNum(`WA-INV-${Math.round(Math.random() * 900 + 100)}`);
  };

  const handleSimulateClientPayReceipt = (inv: Invoice) => {
    addPaymentProof(inv.id, inv.totalAmount, 'Bank Transfer', {
      title: `Client Uploaded Bank Voucher - Slip_${inv.invoiceNumber}.pdf`,
      documentType: 'Payment slip receipt',
      filePath: `/vault/payment_proofs/slip_${inv.invoiceNumber}.pdf`,
      mimeType: 'application/pdf',
      fileSize: 450,
      verificationStatus: 'Pending Review',
      uploadedBy: 'u_investor'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans p-2">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">{t.menuInvoices}</h3>
        <p className="text-xs text-slate-500 mt-1">
          Review generated fiduciaries ledgers, track physical wire transfer status checks, and render active compliance charts.
        </p>
      </div>

      {/* Grid summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-indigo-600" />
            <div>
              <span className="text-gray-400 block font-bold text-[9px] uppercase">Aggregate Ledger Invoiced</span>
              <span className="text-lg font-black text-slate-950">{totalRaised.toLocaleString()} AED</span>
            </div>
          </div>
          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">Total raised</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="text-gray-400 block font-bold text-[9px] uppercase">Sponsor Payments Collected</span>
              <span className="text-lg font-black text-emerald-950">{totalPaid.toLocaleString()} AED</span>
            </div>
          </div>
          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">Cleared</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-red-600" />
            <div>
              <span className="text-gray-400 block font-bold text-[9px] uppercase">Active Fiduciary Arrears</span>
              <span className="text-lg font-black text-red-950">{totalOverdue.toLocaleString()} AED</span>
            </div>
          </div>
          <span className="text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">Uncollected</span>
        </div>
      </div>

      {/* Recharts Analytics graphs row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Payments Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Fee Collection Distribution Percentage</h4>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip formatter={(value) => `${value.toLocaleString()} AED`} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {financeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Juridiction wise */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Emirate jurisdiction Fee Share Spreads</h4>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emirateFeeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip formatter={(value) => `${value.toLocaleString()} AED`} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main invoices tracker grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Ledger */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-950 text-sm">Dispatched Service Invoices Ledger</h4>
          
          <div className="space-y-3.5 max-h-[400px] overflow-y-auto">
            {invoices.map(inv => {
              const comp = companies.find(c => c.id === inv.companyId);
              const invoicePayment = payments.find(p => p.invoiceId === inv.id);

              return (
                <div key={inv.id} className="p-4 bg-slate-50 border border-gray-100 hover:bg-slate-100/50 rounded-xl transition flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-slate-800 text-xs block">{inv.invoiceNumber}</span>
                    <span className="text-indigo-600 font-bold block">{comp ? comp.legalNameEn : 'Archived Corporate'}</span>
                    <span className="text-[10px] text-gray-500 block">Date raised: {inv.invoiceDate} | Expiry limit: {inv.dueDate}</span>
                    <p className="font-black text-sm text-slate-950 mt-1">{inv.totalAmount.toLocaleString()} AED</p>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase inline-block ${
                      inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {inv.paymentStatus}
                    </span>

                    <div className="flex space-x-1.5">
                      {inv.paymentStatus === 'Overdue' && (
                        <button 
                          onClick={() => handleSimulateClientPayReceipt(inv)}
                          className="px-2 py-1 bg-slate-900 text-white rounded text-[9.5px] font-bold"
                        >
                          Simulate client upload receipt
                        </button>
                      )}

                      {inv.paymentStatus === 'Partially Paid' && (
                        <button 
                          onClick={() => {
                            if (invoicePayment) verifyPayment(invoicePayment.id, true);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-[9.5px]"
                        >
                          Verify bank transfer proof (AED {inv.totalAmount.toLocaleString()})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dispatch Form */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-950 text-sm">Raise fee ledger</h4>
          
          <form onSubmit={handleCreateNewInvoice} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company Entity</label>
              <select 
                value={newInvCompanyId} 
                onChange={e => setNewInvCompanyId(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg bg-white bg-white"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.legalNameEn}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Invoice Label No</label>
                <input 
                  type="text" 
                  value={newInvNum} 
                  onChange={e => setNewInvNum(e.target.value)} 
                  className="w-full p-2 border border-gray-200 rounded-lg bg-white" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Fee Amount (AED)</label>
                <input 
                  type="number" 
                  value={newInvAmount} 
                  onChange={e => setNewInvAmount(Number(e.target.value))} 
                  className="w-full p-2 border border-gray-200 rounded-lg bg-white" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
            >
              Raise Service Invoice
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
