/**
 * SERVER-SIDE notification creation to bypass RLS issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, type, link, metadata } = body;

    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use service role to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('[Notifications API] Creating notification for user:', userId);

    // Create notification using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        link,
        metadata: metadata || {},
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('[Notifications API] Error:', error);
      throw error;
    }

    console.log('[Notifications API] Notification created successfully:', data.id);

    return NextResponse.json({
      success: true,
      notification: data
    });
  } catch (error: any) {
    console.error('[Notifications API] Failed to create notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}
