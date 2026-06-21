import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DatabaseProfile } from '../lib/database.types';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<DatabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Get User Session
    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          // Fetch associated profile
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (prof) {
            setProfile(prof);
          } else {
            // Emulate or create default profile if missing
            const mockProf: DatabaseProfile = {
              id: session.user.id,
              first_name: 'Faisal',
              last_name: 'Al-Mansoori',
              display_name: 'Faisal Al-Mansoori',
              email: session.user.email || 'faisal@wakeel.ae',
              preferred_language: 'en',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setProfile(mockProf);
          }
        } else {
          setCurrentUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching auth session:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (prof) {
          setProfile(prof);
        }
      } else {
        setCurrentUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return {
    currentUser,
    profile,
    loading,
    isAuthenticated: !!currentUser,
    setProfile
  };
}
