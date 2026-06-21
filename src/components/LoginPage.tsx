import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Sparkles, Globe, UserCheck, AlertCircle } from 'lucide-react';
import { dictionary } from '../store/translations';

interface LoginPageProps {
  onLoginSuccess: (userId: string) => void;
  currentLanguage: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, currentLanguage, setLanguage }) => {
  const isRtl = currentLanguage === 'ar';
  const t = dictionary[currentLanguage];

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              display_name: `${firstName} ${lastName}`.trim()
            }
          }
        });

        if (error) throw error;
        
        setInfoMsg(
          currentLanguage === 'ar'
            ? 'تم إنشاء الحساب! يرجى مراجعة بريدك الإلكتروني للتأكيد.'
            : 'Account created! Please check your email to verify your registration.'
        );
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        if (data?.user) {
          onLoginSuccess(data.user.id);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication operation failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-populate demo user credentials for convenience during testing
  const useSampleCredential = (role: 'owner' | 'agent' | 'pro' | 'investor') => {
    const creds = {
      owner: { e: 'faisal.owner@wakeel.ae', p: 'demo-pass-123' },
      agent: { e: 'fatima.compliance@wakeel.ae', p: 'demo-pass-123' },
      pro: { e: 'ibrahim.pro@wakeel.ae', p: 'demo-pass-123' },
      investor: { e: 'tariq.s@aperture-investments.com', p: 'demo-pass-123' },
    };
    setEmail(creds[role].e);
    setPassword(creds[role].p);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Top language toggle card */}
      <div className="w-full max-w-md flex justify-end mb-4">
        <button 
          onClick={() => setLanguage(currentLanguage === 'en' ? 'ar' : 'en')}
          className="text-xs font-semibold px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-[#1E293B] hover:bg-[#F8FAFC] shadow-xs flex items-center gap-1.5 transition"
        >
          <Globe className="w-3.5 h-3.5 text-[#818CF8]" />
          <span>{currentLanguage === 'en' ? 'العربية (Arabic)' : 'English'}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
        
        {/* Decorative Brand Header */}
        <div className="bg-[#0F172A] p-8 text-center relative border-b border-[#1E293B]">
          <div className="absolute top-3 right-3 flex items-center text-[#818CF8] text-[10px] uppercase font-bold tracking-widest gap-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>v2.1 live</span>
          </div>
          
          <div className="w-14 h-14 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-xl flex items-center justify-center mx-auto shadow-lg mb-4">
            <span className="text-white text-2xl">🛡️</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            {isSignUp ? (currentLanguage === 'ar' ? 'إنشاء ملف حماية تجاري جديد' : 'Enroll Regulatory Shield Account') : t.appName}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1.5 font-medium">
            {currentLanguage === 'ar' ? 'بوابة إدارة وكيل الخدمات المحلي والالتزام التنظيمي بدولة الإمارات' : 'UAE Local Service Agent Compliance & Corporate Tenancy Portal'}
          </p>
        </div>

        {/* Form panel body */}
        <div className="p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded text-rose-950 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded text-emerald-950 text-xs flex items-start gap-2 animate-fade-in">
              <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-semibold">
            
            {isSignUp && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[#64748B] text-[10px] uppercase font-bold">First Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 focus:outline-indigo-500"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[#64748B] text-[10px] uppercase font-bold">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 focus:outline-indigo-500"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[#64748B] text-[10px] uppercase font-bold">
                {currentLanguage === 'ar' ? 'البريد الإلكتروني' : 'Corporate Email Address'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-[#64748B]"><Mail className="w-4 h-4" /></span>
                <input 
                  type="email" 
                  required 
                  className={`w-full p-2.5 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 focus:outline-indigo-500 ${isRtl ? 'text-right' : ''}`}
                  placeholder="name@company.ae"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[#64748B] text-[10px] uppercase font-bold">
                {currentLanguage === 'ar' ? 'كلمة المرور' : 'Password credential'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-[#64748B]"><Lock className="w-4 h-4" /></span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  className={`w-full p-2.5 pl-10 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 focus:outline-indigo-500 ${isRtl ? 'text-right' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-[#64748B] hover:text-[#0F172A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-extrabold shadow-md hover:shadow-lg disabled:bg-indigo-400 mt-2 text-xs uppercase tracking-wider"
            >
              {loading 
                ? (currentLanguage === 'ar' ? 'تجهيز الهوية الأمنية...' : 'Securing login trace...') 
                : (isSignUp 
                    ? (currentLanguage === 'ar' ? 'تسجيل كـ رئيس منشأة' : 'Register Corporate Head') 
                    : (currentLanguage === 'ar' ? 'تسجيل دخول آمن' : 'Authorize Secure Access'))
              }
            </button>
          </form>

          {/* Setup / SignIn Toggle Link */}
          <div className="text-center">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className="text-indigo-600 hover:text-indigo-800 transition font-bold"
            >
              {isSignUp 
                ? (currentLanguage === 'ar' ? 'لديك حساب بالفعل؟ تسجيل دخول' : 'Already registered? Request authentication link')
                : (currentLanguage === 'ar' ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'Request LSA business onboarding credential')
              }
            </button>
          </div>

          {/* Quick Demo Prepopulate buttons for convenient validation */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2.5">
            <span className="block text-[8.5px] uppercase font-black text-slate-400 tracking-wider text-center">
              Instant Emulator Credentials for evaluation
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button 
                onClick={() => useSampleCredential('owner')}
                className="p-1 px-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded font-bold text-center truncate"
              >
                Owner Portal
              </button>
              <button 
                onClick={() => useSampleCredential('agent')}
                className="p-1 px-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded font-bold text-center truncate"
              >
                Agent Portal
              </button>
              <button 
                onClick={() => useSampleCredential('pro')}
                className="p-1 px-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded font-bold text-center truncate"
              >
                PRO Portal
              </button>
              <button 
                onClick={() => useSampleCredential('investor')}
                className="p-1 px-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded font-bold text-center truncate"
              >
                Investor Portal
              </button>
            </div>
          </div>

        </div>

        {/* Footer with legal/AI Disclaimers */}
        <div className="px-8 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center text-[9px] text-[#64748B] space-y-1 font-medium">
          <p>🛡️ Private secure workspace. In compliance with UAE Decree-Law No. 45 of 2021 on PDPL.</p>
          <p className="italic text-slate-400 font-sans">
            AI advisory reports are informational administrative drafts. Verification is required before government submission.
          </p>
        </div>

      </div>

    </div>
  );
};
