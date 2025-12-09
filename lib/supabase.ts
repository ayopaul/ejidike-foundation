//lib/supabase.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Use 'any' for Database type to avoid strict type checking issues after package upgrades
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDatabase = any;

// Singleton instance for client-side Supabase client
let clientInstance: ReturnType<typeof createClientComponentClient<AnyDatabase>> | null = null;

// Client component client (for App Router) - returns singleton
export const createSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // During SSR, create a new instance each time (won't persist)
    return createClientComponentClient<AnyDatabase>();
  }

  if (!clientInstance) {
    clientInstance = createClientComponentClient<AnyDatabase>();
  }
  return clientInstance;
};

// For convenience, export a getter that creates on first access (client-side only)
export const supabase = typeof window !== 'undefined'
  ? createSupabaseClient()
  : createClientComponentClient<AnyDatabase>();

// Server-side client (for Server Components)
export const createServerSupabaseClient = () => {
  const { cookies } = require('next/headers');
  const { createServerComponentClient } = require('@supabase/auth-helpers-nextjs');

  return createServerComponentClient({ cookies });
};