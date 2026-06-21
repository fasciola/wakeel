import React from 'react';
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

export const AuthGate: React.FC<AuthGateProps> = ({
    children,
    currentLanguage,
    setLanguage,
}) => {
    const { currentUser, loading: authLoading } = useAuth();

    const {
        activeWorkspace,
        activeMembership,
        loading: wsLoading,
        setActiveWorkspace,
        setActiveMembership,
    } = useWorkspace(currentUser?.id);

    const handleOnboardingComplete = (_workspaceId: string) => {
        window.location.reload();
    };

    const handleLogout = () => {
        setActiveWorkspace(null);
        setActiveMembership(null);
    };

    const handleLoginSuccess = (_userId: string) => {
        // useAuth refreshes the session automatically.
    };

    if (authLoading || (currentUser && wsLoading)) {
        return (<div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center font-sans space-y-4"> <div className="relative flex items-center justify-center"> <div className="absolute w-16 h-16 bg-[#818CF8]/25 rounded-full animate-ping" />

            ```
            <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-xl flex items-center justify-center shadow-lg relative z-10 border border-[#818CF8]/30">
                <Shield className="w-8 h-8 text-white animate-pulse" />
            </div>
        </div>

            <div className="text-center space-y-1">
                <h2 className="text-[#F8FAFC] text-sm font-bold tracking-wider uppercase">
                    Wakeel Aman | وكيل آمن
                </h2>

                <p className="text-[#94A3B8] text-xs font-semibold flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#818CF8]" />
                    <span>Securing regulatory workspace nodes...</span>
                </p>
            </div>
        </div>
        );
      

}

if (!currentUser) {
return ( <LoginPage
     onLoginSuccess={handleLoginSuccess}
     currentLanguage={currentLanguage}
     setLanguage={setLanguage}
   />
);
}

if (!activeWorkspace) {
return ( <WorkspaceOnboarding
     userId={currentUser.id}
     onOnboardingComplete={handleOnboardingComplete}
     currentLanguage={currentLanguage}
   />
);
}

return children({
userId: currentUser.id,
workspace: activeWorkspace,
membership: activeMembership,
onLogout: handleLogout,
currentLanguage,
setLanguage,
});
};
