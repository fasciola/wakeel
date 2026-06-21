import { useEffect, useState } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { DatabaseProfile } from '../lib/database.types';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<DatabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async (session: Session | null) => {
      const user = session?.user ?? null;

      if (!isMounted) return;

      setCurrentUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error('Unable to load authenticated user profile:', error);
        setProfile(null);
      } else {
        setProfile((data as DatabaseProfile | null) ?? null);
      }

      setLoading(false);
    };

    const initialiseAuth = async () => {
      setLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Unable to restore Supabase session:', error);
      }

      await syncSession(session);
    };

    void initialiseAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  return {
    currentUser,
    profile,
    loading,
    isAuthenticated: Boolean(currentUser),
    setProfile,
    signOut,
  };
}
