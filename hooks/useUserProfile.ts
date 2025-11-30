//hooks/useUserProfile.ts

'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabase';
import { Profile, UserRole } from '@/types/database';

interface UseUserProfileReturn {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createSupabaseClient();

  const fetchProfile = async (userId: string) => {
    try {
      // Order by created_at to get the newest profile first
      // (in case there are duplicate profiles)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Profile not found');
      }

      // Take the first (newest) profile if multiple exist
      const profileData = data[0];

      // Warn if duplicates found
      if (data.length > 1) {
        console.warn(`Multiple profiles found for user ${userId}. Using the newest one.`);
      }

      setProfile(profileData);
      setRole(profileData.role);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err as Error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error getting session:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    role,
    loading,
    error,
    refreshProfile,
  };
}