import { NextRequest, NextResponse } from 'next/server';

// Cookie name must match middleware
const SITE_ACCESS_COOKIE = 'site_access_granted';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Get the site password from environment
    const sitePassword = process.env.SITE_PASSWORD;

    if (!sitePassword) {
      // If no password is set, grant access automatically
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
    if (password !== sitePassword) {
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
