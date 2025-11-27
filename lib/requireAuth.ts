/**
 * FILE PATH: /ejdk/ejidike-foundation/lib/requireAuth.ts
 * PURPOSE: Server-side authentication check for server components
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAuth(allowedRoles?: string[]) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Check role if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!profile || !allowedRoles.includes(profile.role)) {
      redirect('/unauthorized');
    }

    return { user: session.user, profile };
  }

  return { user: session.user };
}