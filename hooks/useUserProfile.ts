//hooks/useUserProfile.ts

'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to access user profile data.
 * This is a wrapper around useAuth for backwards compatibility.
 * All auth state is managed centrally by AuthProvider.
 */
export function useUserProfile() {
  return useAuth();
}