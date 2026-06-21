import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DatabaseWorkspace, DatabaseWorkspaceMembership } from '../lib/database.types';

export function useWorkspace(userId: string | undefined) {
  const [workspaces, setWorkspaces] = useState<DatabaseWorkspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<DatabaseWorkspace | null>(null);
  const [activeMembership, setActiveMembership] = useState<DatabaseWorkspaceMembership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setActiveMembership(null);
      setLoading(false);
      return;
    }

    async function loadWorkspaces() {
      setLoading(true);
      try {
        // Fetch all active workspace memberships for the user
        const { data: memberships, error: memError } = await supabase
          .from('workspace_memberships')
          .select('*')
          .eq('user_id', userId);

        if (memError) throw memError;

        if (memberships && memberships.length > 0) {
          const workspaceIds = memberships.map(m => m.workspace_id);
          
          // Get workspace metadata
          const { data: ws, error: wsError } = await supabase
            .from('workspaces')
            .select('*')
            .in('id', workspaceIds);

          if (wsError) throw wsError;

          setWorkspaces(ws || []);
          
          // Set first workspace as active by default
          const defaultWS = ws?.[0] || null;
          setActiveWorkspace(defaultWS);

          const defaultMem = memberships.find(m => m.workspace_id === defaultWS?.id) || null;
          setActiveMembership(defaultMem);
        } else {
          // If no workspaces matched, look in profile or mock defaults
          setWorkspaces([]);
          setActiveWorkspace(null);
          setActiveMembership(null);
        }
      } catch (err) {
        console.error('Error loading active workspaces list:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaces();
  }, [userId]);

  const switchWorkspace = async (workspaceId: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    if (!ws) return;

    setLoading(true);
    try {
      const { data: m } = await supabase
        .from('workspace_memberships')
        .select('*')
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)
        .single();

      setActiveWorkspace(ws);
      if (m) {
        setActiveMembership(m);
      }
    } catch (err) {
      console.error('Failed to switch workspace context:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    workspaces,
    activeWorkspace,
    activeMembership,
    loading,
    switchWorkspace,
    setWorkspaces,
    setActiveWorkspace,
    setActiveMembership
  };
}
