import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Cookie name must match middleware
const SITE_ACCESS_COOKIE = 'site_access_granted';

// GET - Check if coming soon mode is enabled (used by middleware)
export async function GET() {
  try {
    // Use service role client for unauthenticated access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'coming_soon')
        .single();

      if (data?.value) {
        const settings = data.value as { enabled: boolean; password: string };
        return NextResponse.json({
          enabled: settings.enabled && !!settings.password,
        });
      }
    }

    // Fall back to env var
    const envPassword = process.env.SITE_PASSWORD;
    return NextResponse.json({
      enabled: !!envPassword,
    });
  } catch {
    // On error, check env var
    const envPassword = process.env.SITE_PASSWORD;
    return NextResponse.json({
      enabled: !!envPassword,
    });
  }
}

// Helper to get coming soon settings
async function getComingSoonSettings() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'coming_soon')
      .single();

    if (data?.value) {
      return data.value as { enabled: boolean; password: string };
    }
  } catch {
    // Table might not exist yet, fall back to env var
  }

  // Fall back to env var
  const envPassword = process.env.SITE_PASSWORD;
  return {
    enabled: !!envPassword,
    password: envPassword || '',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Get settings from database or env
    const settings = await getComingSoonSettings();

    if (!settings.enabled || !settings.password) {
      // If coming soon mode is disabled or no password set, grant access automatically
      const response = NextResponse.json({ success: true });
      response.cookies.set(SITE_ACCESS_COOKIE, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      return response;
    }

    // Verify password
    if (password !== settings.password) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Password correct - set cookie and grant access
    const response = NextResponse.json({ success: true });
    response.cookies.set(SITE_ACCESS_COOKIE, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// Endpoint to revoke access (logout from coming soon mode)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SITE_ACCESS_COOKIE);
  return response;
}
