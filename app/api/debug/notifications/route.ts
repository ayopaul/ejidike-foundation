/**
 * Debug endpoint to check notifications in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get all notifications (bypass RLS)
    const { data: allNotifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (notifError) {
      console.error('Error fetching notifications:', notifError);
    }

    // Get all profiles to map user_ids to names
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role');

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
    }

    // Map notifications to include user info
    const notificationsWithUsers = allNotifications?.map(notif => {
      const user = profiles?.find(p => p.id === notif.user_id);
      return {
        ...notif,
        user_name: user?.full_name,
        user_email: user?.email,
        user_role: user?.role
      };
    });

    return NextResponse.json({
      success: true,
      total_notifications: allNotifications?.length || 0,
      notifications: notificationsWithUsers,
      profiles_count: profiles?.length || 0
    });
  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
