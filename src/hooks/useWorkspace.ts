import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  DatabaseWorkspace,
  DatabaseWorkspaceMembership,
} from '../lib/database.types';

export function useWorkspace(userId: string | undefined) {
  const [workspaces, setWorkspaces] = useState<DatabaseWorkspace[]>([]);
  const [memberships, setMemberships] = useState<
    DatabaseWorkspaceMembership[]
  >([]);
  const [activeWorkspace, setActiveWorkspace] =
    useState<DatabaseWorkspace | null>(null);
  const [activeMembership, setActiveMembership] =
    useState<DatabaseWorkspaceMembership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const clearWorkspaceState = () => {
      if (!isMounted) return;

      setWorkspaces([]);
      setMemberships([]);
      setActiveWorkspace(null);
      setActiveMembership(null);
    };

    const loadWorkspaces = async () => {
      if (!userId) {
        clearWorkspaceState();

        if (isMounted) {
          setLoading(false);
        }

        return;
      }

      if (isMounted) {
        setLoading(true);
      }

      try {
        const { data: membershipRows, error: membershipError } =
          await supabase
            .from('workspace_memberships')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: true });

        if (membershipError) {
          throw membershipError;
        }

        const activeMemberships =
          (membershipRows as DatabaseWorkspaceMembership[] | null) ?? [];

        if (activeMemberships.length === 0) {
          clearWorkspaceState();
          return;
        }

        const workspaceIds = activeMemberships.map(
          (membership) => membership.workspace_id,
        );

        const { data: workspaceRows, error: workspaceError } = await supabase
          .from('workspaces')
          .select('*')
          .in('id', workspaceIds)
          .order('created_at', { ascending: true });

        if (workspaceError) {
          throw workspaceError;
        }

        if (!isMounted) return;

        const returnedWorkspaces =
          (workspaceRows as DatabaseWorkspace[] | null) ?? [];

        const workspaceById = new Map(
          returnedWorkspaces.map((workspace) => [workspace.id, workspace]),
        );

        const orderedWorkspaces = workspaceIds
          .map((workspaceId) => workspaceById.get(workspaceId))
          .filter(
            (workspace): workspace is DatabaseWorkspace =>
              workspace !== undefined,
          );

        const nextWorkspace = orderedWorkspaces[0] ?? null;
        const nextMembership = nextWorkspace
          ? activeMemberships.find(
              (membership) => membership.workspace_id === nextWorkspace.id,
            ) ?? null
          : null;

        setWorkspaces(orderedWorkspaces);
        setMemberships(activeMemberships);
        setActiveWorkspace(nextWorkspace);
        setActiveMembership(nextMembership);
      } catch (error) {
        console.error('Unable to load active workspaces:', error);
        clearWorkspaceState();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadWorkspaces();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const switchWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find((item) => item.id === workspaceId);
    const membership =
      memberships.find((item) => item.workspace_id === workspaceId) ?? null;

    if (!workspace || !membership) {
      return;
    }

    setActiveWorkspace(workspace);
    setActiveMembership(membership);
  };

  return {
    workspaces,
    memberships,
    activeWorkspace,
    activeMembership,
    loading,
    switchWorkspace,
    setWorkspaces,
    setActiveWorkspace,
    setActiveMembership,
  };
}
