import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWorkspace } from '../hooks/useWorkspace';
import { LoginPage } from './LoginPage';
import { WorkspaceOnboarding } from './WorkspaceOnboarding';
import { Shield, Loader2 } from 'lucide-react';

interface AuthGateProps {
  children: (props: { 
    userId: string; 
    workspace: any; 
    membership: any; 
    onLogout: () => void;
    currentLanguage: 'en' | 'ar';
    setLanguage: (lang: 'en' | 'ar') => void;
  }) => React.ReactElement;
  currentLanguage: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children, currentLanguage, setLanguage }) => {
  const { currentUser, profile, loading: authLoading } = useAuth();
  const { 
    activeWorkspace, 
    activeMembership, 
    loading: wsLoading, 
    setActiveWorkspace,
    setActiveMembership,
    setWorkspaces
  } = useWorkspace(currentUser?.id);

  // When a user finishes onboarding, refresh workspace states
  const handleOnboardingComplete = (workspaceId: string) => {
    const virtualWorkspace = {
      id: workspaceId,
      name_en: 'Al Noor Local Services Co.',
      name_ar: 'النور للخدمات المحلية ش.ذ.م.م',
      workspace_type: 'Corporate Service Group',
      timezone: 'Asia/Dubai',
      subscription_plan: 'Professional' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const virtualMembership = {
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      user_id: currentUser?.id || 'u1',
      role: 'workspace_owner' as const,
      permissions: ['*'],
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setWorkspaces([virtualWorkspace]);
    setActiveWorkspace(virtualWorkspace);
    setActiveMembership(virtualMembership);
  };

  const handleLogout = async () => {
    // Standard sign out logic
    setActiveWorkspace(null);
    setActiveMembership(null);
  };

  const handleLoginSuccess = async (uid: string) => {
    // Refeshing auth triggered by signin hook
  };

  if (authLoading || (currentUser && wsLoading)) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center font-sans space-y-4">
        {/* Animated Security Orb */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 bg-[#818CF8]/25 rounded-full animate-ping"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-xl flex items-center justify-center shadow-lg relative z-10 border border-[#818CF8]/30">
            <Shield className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-[#F8FAFC] text-sm font-bold tracking-wider uppercase">Wakeel Aman | وكيل آمن</h2>
          <p className="text-[#94A3B8] text-xs font-semibold flex items-center justify-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#818CF8]" />
            <span>Securing regulatory workspace nodes...</span>
          </p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!currentUser) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess}
        currentLanguage={currentLanguage}
        setLanguage={setLanguage}
      />
    );
  }

  // Signed in, but no portfolio workspaces registered yet (Requires workspace onboarding)
  if (!activeWorkspace) {
    return (
      <WorkspaceOnboarding 
        userId={currentUser.id} 
        onOnboardingComplete={handleOnboardingComplete}
        currentLanguage={currentLanguage}
      />
    );
  }

  // Active portfolio workspace ready
  return children({
    userId: currentUser.id,
    workspace: activeWorkspace,
    membership: activeMembership,
    onLogout: handleLogout,
    currentLanguage,
    setLanguage
  });
};
