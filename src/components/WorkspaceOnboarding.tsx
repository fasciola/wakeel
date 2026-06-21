import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, Building, Globe, Zap, AlertCircle } from 'lucide-react';

interface WorkspaceOnboardingProps {
  userId: string;
  onOnboardingComplete: (workspaceId: string) => void;
  currentLanguage: 'en' | 'ar';
}

export const WorkspaceOnboarding: React.FC<WorkspaceOnboardingProps> = ({ 
  userId, 
  onOnboardingComplete,
  currentLanguage 
}) => {
  const isRtl = currentLanguage === 'ar';
  
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [type, setType] = useState('Corporate Service Group');
  const [plan, setPlan] = useState<'Starter' | 'Professional' | 'Business'>('Professional');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const workspaceId = crypto.randomUUID();
      const membershipId = crypto.randomUUID();

      // 1. Insert workspace
      const { error: wsError } = await supabase.from('workspaces').insert({
        id: workspaceId,
        name_en: nameEn,
        name_ar: nameAr || nameEn,
        workspace_type: type,
        timezone: 'Asia/Dubai',
        subscription_plan: plan,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (wsError) throw wsError;

      // 2. Insert member entry (Owner)
      const { error: memError } = await supabase.from('workspace_memberships').insert({
        id: membershipId,
        workspace_id: workspaceId,
        user_id: userId,
        role: 'workspace_owner',
        permissions: ['*'], // Universal permissions
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (memError) throw memError;

      // Finish setup
      onOnboardingComplete(workspaceId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Onboarding registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-[#0F172A] p-8 text-center border-b border-[#1E293B]">
          <div className="w-12 h-12 bg-[#818CF8]/10 text-[#818CF8] rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-[#F8FAFC]">
            {currentLanguage === 'ar' ? 'تهيئة بيئة العمل الخاصة بك' : 'Construct Corporate Compliance Workspace'}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            {currentLanguage === 'ar' ? 'أنشئ بيئة آمنة لإدارة رخص وتراخيص شركاتك ومستثمريك' : 'Isolate compliance portfolios, licenses, and legal deeds within an audited tenant domain.'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 text-xs font-semibold">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded text-rose-950 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[#64748B] text-[10px] uppercase font-bold">Workspace Name (English)</label>
              <input 
                type="text" 
                required 
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 focus:outline-indigo-500 font-sans"
                placeholder="e.g. Al Noor Corporate Group"
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[#64748B] text-[10px] uppercase font-bold">Workspace Name (العربية)</label>
              <input 
                type="text" 
                className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 focus:outline-indigo-500 text-right"
                placeholder="مثال: مجموعة النور للخدمات"
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[#64748B] text-[10px] uppercase font-bold">Operation Entity Model</label>
            <select 
              className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 focus:outline-indigo-500"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="Corporate Service Group">Corporate Group LSA Portfolio</option>
              <option value="Single Family Enterprise">Independent Business / Family Office</option>
              <option value="PRO Professional Desk">Regional PRO & Government Liaison Desk</option>
              <option value="Foreign Branch Office">Multinational Subsidiary Management</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[#64748B] text-[10px] uppercase font-bold">SaaS Protection Tier</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Starter', 'Professional', 'Business'] as const).map(p => (
                <div 
                  key={p}
                  onClick={() => setPlan(p)}
                  className={`p-3.5 rounded-xl border cursor-pointer text-center space-y-1 transition ${
                    plan === p ? 'border-indigo-600 bg-indigo-50/10 text-indigo-700 shadow-sm' : 'border-[#E2E8F0] bg-white text-slate-700 hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span className="block font-black text-xs uppercase">{p}</span>
                  <span className="block text-[8.5px] text-[#64748B] lowercase font-semibold">
                    {p === 'Starter' && 'uaf setup'}
                    {p === 'Professional' && 'multi-tenant lsa'}
                    {p === 'Business' && 'unlimited audits'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-extrabold shadow-md disabled:bg-indigo-400 capitalize text-xs tracking-wider"
          >
            {loading ? 'Registering legal tenant spaces...' : 'Propose & Bootstrap Workspace'}
          </button>
        </form>

        {/* Footer info lock */}
        <div className="px-8 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center text-[9px] text-[#64748B]">
          🤝 By continuing, you authorize establishing Al-Mansoori regulatory escrow and data policies on your isolated tenant node.
        </div>

      </div>
    </div>
  );
};
