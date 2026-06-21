import { supabase } from './supabase';
import { DatabaseProfile, DatabaseWorkspaceMembership } from './database.types';

export interface AuthenticatedSession {
  user: {
    id: string;
    email: string;
  } | null;
  profile: DatabaseProfile | null;
  activeMembership: DatabaseWorkspaceMembership | null;
  workspaces: { id: string; name_en: string; name_ar: string; role: string }[];
}

// Loads session, profile, workspace memberships, and default active workspace
export async function getSessionDetails(): Promise<AuthenticatedSession> {
  const sessionResult = await supabase.auth.getSession();
  const session = sessionResult.data.session;
  
  if (!session?.user) {
    return { user: null, profile: null, activeMembership: null, workspaces: [] };
  }

  const userId = session.user.id;

  // 1. Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // 2. Fetch workspace memberships with names
  const { data: memberships } = await supabase
    .from('workspace_memberships')
    .select('*, workspaces(name_en, name_ar)')
    .eq('user_id', userId);

  const parsedWorkspaces = (memberships || []).map((m: any) => ({
    id: m.workspace_id,
    name_en: m.workspaces?.name_en || 'Workspace',
    name_ar: m.workspaces?.name_ar || 'بيئة العمل',
    role: m.role
  }));

  // Match active or default to the first one
  const activeM = memberships?.[0] || null;

  return {
    user: {
      id: userId,
      email: session.user.email || ''
    },
    profile: profile || null,
    activeMembership: activeM,
    workspaces: parsedWorkspaces
  };
}

// Log out helper
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
