/**
 * FILE PATH: /ejdk/ejidike-foundation/middleware.ts
 * PURPOSE: Protect routes based on authentication and role
 * FEATURE: Password protection for pre-launch access
 */

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Password protection cookie name
const SITE_ACCESS_COOKIE = 'site_access_granted';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ====== PASSWORD PROTECTION (Coming Soon Mode) ======
  // Check if site password is set (enables coming soon mode)
  const sitePassword = process.env.SITE_PASSWORD;

  if (sitePassword) {
    // Routes that bypass password protection
    const bypassRoutes = [
      '/coming-soon',
      '/api/site-access',
      '/_next',
      '/favicon.ico',
      '/images',
      '/api/health',
    ];

    const shouldBypass = bypassRoutes.some(route => path.startsWith(route));

    if (!shouldBypass) {
      // Check for access cookie
      const accessCookie = request.cookies.get(SITE_ACCESS_COOKIE);

      if (!accessCookie || accessCookie.value !== 'true') {
        // Redirect to coming soon / password page
        return NextResponse.redirect(new URL('/coming-soon', request.url));
      }
    }
  }

  // ====== EXISTING AUTH LOGIC ======
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/verify-email',
    '/api/auth/callback',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify-email',
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile for redirect:', profileError);
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

  // Role-based route protection
  if (session) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    // Debug logging
    if (profileError || !profile) {
      console.error('Profile fetch error in middleware:', {
        error: profileError,
        userId: session.user.id,
        profileData: profile,
        path: path
      });
    }

    // If profile doesn't exist or error fetching it
    if (profileError || !profile) {
      // Don't redirect if already on auth pages or callback
      if (!path.startsWith('/login') && !path.startsWith('/register') && !path.startsWith('/api/auth')) {
        console.log('Redirecting to login due to missing profile');
        return NextResponse.redirect(new URL('/login?error=no_profile', request.url));
      }
    }

    // Admin routes
    if (path.startsWith('/admin/') || path === '/admin' || path.startsWith('/api/admin')) {
      if (profile?.role !== 'admin') {
        console.log(`Access denied to ${path} for user with role: ${profile?.role}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Mentor routes (use /mentor/ with trailing slash to avoid matching /mentorship)
    // Note: /api/mentorship routes are accessible by applicants and mentors
    if (path.startsWith('/mentor/') || path === '/mentor') {
      if (profile?.role !== 'mentor' && profile?.role !== 'admin') {
        console.log(`Access denied to ${path} for user with role: ${profile?.role}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Partner routes
    if (path.startsWith('/partner/') || path === '/partner' || path.startsWith('/api/partners') || path.startsWith('/api/opportunities')) {
      if (profile?.role !== 'partner' && profile?.role !== 'admin') {
        console.log(`Access denied to ${path} for user with role: ${profile?.role}`);
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