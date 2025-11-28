//lib/supabase.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

// Singleton instance for client-side Supabase client
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// Client-side Supabase client (singleton pattern)
export const supabase = (() => {
  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>();
  }
  return clientInstance;
})();

// Client component client (for App Router) - returns the same singleton
export const createSupabaseClient = () => {
  return supabase;
};

// Server-side client (for Server Components)
export const createServerSupabaseClient = () => {
  const { cookies } = require('next/headers');
  const { createServerComponentClient } = require('@supabase/auth-helpers-nextjs');

  return createServerComponentClient({ cookies });
};