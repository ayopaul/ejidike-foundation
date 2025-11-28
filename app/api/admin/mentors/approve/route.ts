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
      application_id,
      status, // 'approved' or 'rejected'
      admin_notes,
      // Mentor profile data if approved
      bio,
      headline,
      expertise_areas,
      skills,
      years_of_experience,
      max_mentees,
      linkedin_url
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

    // Get mentor application
    const { data: application, error: appError } = await supabase
      .from('mentor_applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update application status
    const { data: updatedApp, error: updateError } = await supabase
      .from('mentor_applications')
      .update({
        status,
        admin_notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', application_id)
      .select(`
        *,
        profile:profiles!mentor_applications_profile_id_fkey (
          id,
          user_id,
          full_name,
          email
        )
      `)
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // If approved, create mentor profile and update user role
    if (status === 'approved') {
      if (!bio || !expertise_areas || !years_of_experience || !max_mentees) {
        return NextResponse.json(
          { error: 'Missing mentor profile data for approval' },
          { status: 400 }
        );
      }

      // Create mentor profile
      const { error: profileError } = await supabase
        .from('mentor_profiles')
        .insert({
          user_id: updatedApp.profile.user_id,
          bio,
          headline,
          expertise_areas,
          skills: skills || [],
          years_of_experience,
          max_mentees,
          linkedin_url,
          availability_status: 'available'
        });

      if (profileError) {
        console.error('Error creating mentor profile:', profileError);
        return NextResponse.json(
          { error: 'Failed to create mentor profile' },
          { status: 500 }
        );
      }

      // Update user role to mentor
      await supabase
        .from('profiles')
        .update({ role: 'mentor' })
        .eq('id', updatedApp.profile.id);
    }

    return NextResponse.json({
      success: true,
      data: updatedApp
    });
  } catch (error: any) {
    console.error('Approve mentor error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}