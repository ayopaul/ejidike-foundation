/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/admin/mentors/approve/route.ts
 * PURPOSE: Admin approval/rejection of mentor applications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createNotification } from '@/lib/notifications';

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

      // Send approval notification
      try {
        await createNotification({
          userId: updatedApp.profile.id,
          title: 'Mentor Application Approved!',
          message: 'Congratulations! Your mentor application has been approved. You can now start mentoring and making a difference.',
          type: 'success',
          link: '/mentor/profile',
          metadata: {
            applicationId: application_id,
            status: 'approved'
          }
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      // Send email
      try {
        const { sendEmail } = await import('@/lib/email');
        const { mentorApprovedEmail } = await import('@/lib/email-templates');

        const emailContent = mentorApprovedEmail({
          mentorName: updatedApp.profile.full_name
        });

        await sendEmail({
          to: updatedApp.profile.email,
          toName: updatedApp.profile.full_name,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    } else {
      // Send rejection notification
      try {
        await createNotification({
          userId: updatedApp.profile.id,
          title: 'Mentor Application Update',
          message: 'Thank you for your interest in becoming a mentor. We are unable to approve your application at this time.',
          type: 'warning',
          link: '/dashboard',
          metadata: {
            applicationId: application_id,
            status: 'rejected'
          }
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      // Send email
      try {
        const { sendEmail } = await import('@/lib/email');
        const { mentorRejectedEmail } = await import('@/lib/email-templates');

        const emailContent = mentorRejectedEmail({
          mentorName: updatedApp.profile.full_name,
          adminNotes: admin_notes
        });

        await sendEmail({
          to: updatedApp.profile.email,
          toName: updatedApp.profile.full_name,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
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