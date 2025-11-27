/**
 * FILE PATH: /ejdk/ejidike-foundation/middleware.ts
 * PURPOSE: Protect routes based on authentication and role
 */

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/auth/callback',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/reset-password',
    '/api/health'
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  // If no session and trying to access protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // If logged in and trying to access auth pages, redirect to appropriate dashboard
  if (session && (path === '/login' || path === '/register')) {
    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

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

  // Role-based route protection
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    // Admin routes
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Mentor routes
    if (path.startsWith('/mentor') || path.startsWith('/api/mentorship')) {
      if (profile?.role !== 'mentor' && profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Partner routes
    if (path.startsWith('/partner') || path.startsWith('/api/partners') || path.startsWith('/api/opportunities')) {
      if (profile?.role !== 'partner' && profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)'
  ]
};