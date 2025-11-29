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
      const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
      }

      if (session) {
        // Get user profile to redirect to appropriate dashboard
        let { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        // If profile doesn't exist, create it
        if (!profile) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.email,
              role: session.user.user_metadata?.role || 'applicant'
            })
            .select('role')
            .single();

          if (!createError && newProfile) {
            profile = newProfile;
          } else {
            console.error('Failed to create profile:', createError);
            // Default to applicant dashboard if profile creation fails
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        }

        let redirectPath = '/dashboard';
        if (profile?.role === 'admin') {
          redirectPath = '/admin/dashboard';
        } else if (profile?.role === 'mentor') {
          redirectPath = '/mentor/dashboard';
        } else if (profile?.role === 'partner') {
          redirectPath = '/partner/dashboard';
        }

        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // No code provided, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error: any) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
  }
}