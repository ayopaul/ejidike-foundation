//lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client component client (for App Router)
export const createSupabaseClient = () => {
  return createClientComponentClient();
};

// Server-side client (for Server Components)
export const createServerSupabaseClient = () => {
  const { cookies } = require('next/headers');
  const { createServerComponentClient } = require('@supabase/auth-helpers-nextjs');
  
  return createServerComponentClient({ cookies });
};