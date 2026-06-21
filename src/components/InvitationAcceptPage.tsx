import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, CheckCircle2, UserPlus, AlertCircle } from 'lucide-react';

interface InvitationAcceptPageProps {
  userId: string;
  onJoinCompleted: (workspaceId: string) => void;
  currentLanguage: 'en' | 'ar';
}

export const InvitationAcceptPage: React.FC<InvitationAcceptPageProps> = ({
  userId,
  onJoinCompleted,
  currentLanguage
}) => {
  const isRtl = currentLanguage === 'ar';
  
  const [token, setToken] = useState('');
  const [invitation, setInvitation] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parse token from URL if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('invite_token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, []);

  const handleVerifyInvite = async () => {
    if (!token.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // Find the pending invitation record matching the user token
      const { data: invite, error } = await supabase
        .from('workspace_invitations')
        .select('*, workspaces(name_en, name_ar)')
        .eq('token', token.trim())
        .eq('status', 'pending')
        .single();

      if (error || !invite) {
        throw new Error('This invitation link is invalid, expired, or already claimed.');
      }

      setInvitation(invite);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invitation check failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimInvite = async () => {
    if (!invitation) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const membershipId = crypto.randomUUID();

      // 1. Create the membership row
      const { error: memError } = await supabase.from('workspace_memberships').insert({
        id: membershipId,
        workspace_id: invitation.workspace_id,
        user_id: userId,
        role: invitation.role,
        permissions: invitation.permissions || ['read_portfolio'],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (memError) throw memError;

      // 2. Mark invite as claimed
      await supabase
        .from('workspace_invitations')
        .update({ status: 'claimed' })
        .eq('id', invitation.id);

      onJoinCompleted(invitation.workspace_id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to link account to the target workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
        
        {/* Banner */}
        <div className="bg-[#0F172A] p-6 text-center border-b border-[#1E293B]">
          <div className="w-10 h-10 bg-[#818CF8]/10 text-[#818CF8] rounded-xl flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-5 h-5" />
          </div>
          <h1 className="text-base font-bold tracking-tight text-[#F8FAFC]">
            {isRtl ? 'قبول دعوة الانضمام لـ بيئة العمل' : 'Associate Corporate Tenant ID'}
          </h1>
        </div>

        {/* Form panel body */}
        <div className="p-8 space-y-5 text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded text-rose-950 font-semibold text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!invitation ? (
            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-[#64748B] text-[10px] uppercase font-bold">Workspace Invite Token</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-slate-900 focus:outline-indigo-500 font-mono"
                  placeholder="Paste setup token or invite UUID"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                />
              </div>

              <button 
                type="button"
                onClick={handleVerifyInvite}
                disabled={loading || !token.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition disabled:bg-indigo-400"
              >
                {loading ? 'Validating Token...' : 'Inspect Invitation Details'}
              </button>
            </div>
          ) : (
            <div className="space-y-5 text-xs font-semibold">
              <div className="p-4 bg-indigo-50/20 border border-slate-200 rounded-xl space-y-1">
                <span className="block text-[10px] uppercase text-[#64748B]">Target Agency Workspace</span>
                <span className="block font-black text-[#0F172A] text-sm truncate">
                  {currentLanguage === 'en' ? invitation.workspaces?.name_en : invitation.workspaces?.name_ar}
                </span>
                <div className="flex justify-between text-[11px] text-[#64748B] pt-2">
                  <span>Assigned Role: <b className="text-indigo-600 uppercase">{invitation.role}</b></span>
                  <span>Initiated by: {invitation.email}</span>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleClaimInvite}
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Claim Invitation & Join</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
