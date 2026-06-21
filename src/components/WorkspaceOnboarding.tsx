import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building, AlertCircle } from 'lucide-react';

interface WorkspaceOnboardingProps {
    userId: string;
    onOnboardingComplete: (workspaceId: string) => void;
    currentLanguage: 'en' | 'ar';
}

type WorkspacePlan = 'Starter' | 'Professional' | 'Business';

export const WorkspaceOnboarding: React.FC<WorkspaceOnboardingProps> = ({
    onOnboardingComplete,
    currentLanguage,
}) => {
    const isRtl = currentLanguage === 'ar';

    const [nameEn, setNameEn] = useState('');
    const [nameAr, setNameAr] = useState('');
    const [type, setType] = useState('Corporate Service Group');
    const [plan, setPlan] = useState<WorkspacePlan>('Professional');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const cleanNameEn = nameEn.trim();
        const cleanNameAr = nameAr.trim();

        if (cleanNameEn.length < 2) {
            setErrorMsg('Workspace name must contain at least 2 characters.');
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            const { data, error } = await supabase.functions.invoke(
                'create-workspace',
                {
                    body: {
                        nameEn: cleanNameEn,
                        nameAr: cleanNameAr,
                        workspaceType: type,
                        subscriptionPlan: plan,
                    },
                },
            );

            if (error) {
                throw error;
            }

            const workspace = data?.workspace;

            if (!workspace?.id) {
                throw new Error(
                    'Workspace creation did not return a valid workspace ID.',
                );
            }

            onOnboardingComplete(workspace.id);
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Onboarding registration failed. Please try again.';

            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4"
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
                <div className="bg-[#0F172A] p-8 text-center border-b border-[#1E293B]">
                    <div className="w-12 h-12 bg-[#818CF8]/10 text-[#818CF8] rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Building className="w-6 h-6" />
                    </div>

                    <h1 className="text-lg font-bold tracking-tight text-[#F8FAFC]">
                        {currentLanguage === 'ar'
                            ? 'تهيئة بيئة العمل الخاصة بك'
                            : 'Construct Corporate Compliance Workspace'}
                    </h1>

                    <p className="text-xs text-[#94A3B8] mt-1">
                        {currentLanguage === 'ar'
                            ? 'أنشئ بيئة آمنة لإدارة رخص وتراخيص شركاتك ومستثمريك'
                            : 'Isolate compliance portfolios, licenses, and legal deeds within an audited tenant domain.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5 text-xs font-semibold">
                    {errorMsg && (
                        <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded text-rose-950 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[#64748B] text-[10px] uppercase font-bold">
                                Workspace Name (English)
                            </label>

                            <input
                                type="text"
                                required
                                minLength={2}
                                maxLength={120}
                                className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 focus:outline-indigo-500 font-sans"
                                placeholder="e.g. Al Noor Corporate Group"
                                value={nameEn}
                                onChange={(event) => setNameEn(event.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[#64748B] text-[10px] uppercase font-bold">
                                Workspace Name (العربية)
                            </label>

                            <input
                                type="text"
                                maxLength={120}
                                className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 focus:outline-indigo-500 text-right"
                                placeholder="مثال: مجموعة النور للخدمات"
                                value={nameAr}
                                onChange={(event) => setNameAr(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[#64748B] text-[10px] uppercase font-bold">
                            Operation Entity Model
                        </label>

                        <select
                            className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 focus:outline-indigo-500"
                            value={type}
                            onChange={(event) => setType(event.target.value)}
                        >
                            <option value="Corporate Service Group">
                                Corporate Group LSA Portfolio
                            </option>
                            <option value="Single Family Enterprise">
                                Independent Business / Family Office
                            </option>
                            <option value="PRO Professional Desk">
                                Regional PRO & Government Liaison Desk
                            </option>
                            <option value="Foreign Branch Office">
                                Multinational Subsidiary Management
                            </option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[#64748B] text-[10px] uppercase font-bold">
                            SaaS Protection Tier
                        </label>

                        <div className="grid grid-cols-3 gap-3">
                            {(['Starter', 'Professional', 'Business'] as const).map(
                                (tier) => (
                                    <button
                                        key={tier}
                                        type="button"
                                        onClick={() => setPlan(tier)}
                                        aria-pressed={plan === tier}
                                        className={`p-3.5 rounded-xl border text-center space-y-1 transition ${plan === tier
                                                ? 'border-indigo-600 bg-indigo-50/10 text-indigo-700 shadow-sm'
                                                : 'border-[#E2E8F0] bg-white text-slate-700 hover:bg-[#F8FAFC]'
                                            }`}
                                    >
                                        <span className="block font-black text-xs uppercase">
                                            {tier}
                                        </span>

                                        <span className="block text-[8.5px] text-[#64748B] lowercase font-semibold">
                                            {tier === 'Starter' && 'uae setup'}
                                            {tier === 'Professional' && 'multi-tenant lsa'}
                                            {tier === 'Business' && 'unlimited audits'}
                                        </span>
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-extrabold shadow-md disabled:bg-indigo-400 disabled:cursor-not-allowed capitalize text-xs tracking-wider"
                    >
                        {loading
                            ? 'Registering legal tenant space...'
                            : 'Propose & Bootstrap Workspace'}
                    </button>
                </form>

                <div className="px-8 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center text-[9px] text-[#64748B]">
                    🤝 By continuing, you authorize establishing Al-Mansoori regulatory
                    escrow and data policies on your isolated tenant node.
                </div>
            </div>
        </div>
    );
};