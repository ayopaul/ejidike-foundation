/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/notifications/route.ts
 * PURPOSE: API routes for fetching and managing notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Fetch notifications for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      console.error('[Notifications API] Profile not found for user:', user.id);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    console.log('[Notifications API] Fetching notifications for profile:', profile.id);

    // Get query params
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch notifications
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Notifications API] Error fetching notifications:', error);
      throw error;
    }

    console.log('[Notifications API] Found', data?.length || 0, 'notifications');

    return NextResponse.json({
      notifications: data || [],
      count: data?.length || 0
    });
  } catch (error: any) {
    console.error('Fetch notifications API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (notificationId) {
      // Mark single notification as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', profile.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json(
        { error: 'Missing notificationId or markAllAsRead flag' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Update notification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notification ID' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', profile.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error: any) {
    console.error('Delete notification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
