/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/applications/review/route.ts
 * PURPOSE: Admin review and approval/rejection of applications
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
      application_id,
      status, // 'approved' or 'rejected'
      reviewer_notes
    } = body;

    if (!application_id || !status) {
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

    // Update application
    const { data: updatedApp, error } = await supabase
      .from('applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewer_notes
      })
      .eq('id', application_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Fetch related data separately
    const { data: program } = await supabase
      .from('programs')
      .select('title, type')
      .eq('id', updatedApp.program_id)
      .single();

    const { data: applicant } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', updatedApp.applicant_id)
      .single();

    const enrichedData = {
      ...updatedApp,
      programs: program,
      applicant
    };

    return NextResponse.json({
      success: true,
      data: enrichedData
    });
  } catch (error: any) {
    console.error('Review application error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}