/**
 * FILE PATH: /ejdk/ejidike-foundation/lib/supabase-server.ts
 * PURPOSE: Supabase client for server components
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies });
};