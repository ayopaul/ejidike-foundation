/**
 * FILE PATH: /ejdk/ejidike-foundation/app/auth/callback/route.ts
 * PURPOSE: Handle auth callbacks (email verification, password reset)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
      const supabase = createRouteHandlerClient({ cookies });
      
      // Exchange code for session
      await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirect to home page or appropriate page
    return NextResponse.redirect(requestUrl.origin);
  } catch (error: any) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}