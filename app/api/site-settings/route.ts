import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Fetch site settings (public for middleware check)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    const supabase = createRouteHandlerClient({ cookies });

    if (key) {
      // Fetch specific setting
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
        // If table doesn't exist or no setting found, return default
        return NextResponse.json({ value: key === 'coming_soon' ? { enabled: false, password: '' } : null });
      }

      return NextResponse.json({ value: data.value });
    }

    // Fetch all settings
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) {
      return NextResponse.json({ settings: [] });
    }

    return NextResponse.json({ settings: data });
  } catch {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST - Update site settings (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is admin
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    // Upsert the setting
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: profile.id,
      }, {
        onConflict: 'key',
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating site setting:', error);
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }

    // Clear the cache cookie so changes take effect immediately
    const response = NextResponse.json({ success: true, setting: data });
    if (key === 'coming_soon') {
      response.cookies.delete('coming_soon_status');
    }
    return response;
  } catch {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
