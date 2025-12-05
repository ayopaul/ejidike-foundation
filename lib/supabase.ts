//lib/supabase.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

// Singleton instance for client-side Supabase client
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// Client component client (for App Router) - returns singleton
export const createSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // During SSR, create a new instance each time (won't persist)
    return createClientComponentClient<Database>();
  }

  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>();
  }
  return clientInstance;
};

// For convenience, export a getter that creates on first access (client-side only)
export const supabase = typeof window !== 'undefined'
  ? createSupabaseClient()
  : createClientComponentClient<Database>();

// Server-side client (for Server Components)
export const createServerSupabaseClient = () => {
  const { cookies } = require('next/headers');
  const { createServerComponentClient } = require('@supabase/auth-helpers-nextjs');

  return createServerComponentClient({ cookies });
};