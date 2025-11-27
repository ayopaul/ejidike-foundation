/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/admin/mentors/approve/route.ts
 * PURPOSE: Admin approval/rejection of mentor applications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      mentor_profile_id,
      status, // 'approved' or 'rejected'
      admin_notes
    } = body;

    if (!mentor_profile_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // Update mentor profile
    const updateData: any = {
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    };

    if (admin_notes) {
      updateData.admin_notes = admin_notes;
    }

    // If approved, set availability to available
    if (status === 'approved') {
      updateData.availability_status = 'available';
    }

    const { data, error } = await supabase
      .from('mentor_profiles')
      .update(updateData)
      .eq('id', mentor_profile_id)
      .select(`
        *,
        profile:profiles!user_id (
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // If approved, update the user's role to mentor in profiles table
    if (status === 'approved') {
      await supabase
        .from('profiles')
        .update({ role: 'mentor' })
        .eq('user_id', data.user_id);
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Approve mentor error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}