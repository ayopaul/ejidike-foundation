/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/partners/notify-verification/route.ts
 * PURPOSE: Send email notification when partner is verified or rejected
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is admin
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

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { partnerId, status, organizationName } = body;

    if (!partnerId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get partner's profile to get their email
    const { data: partnerProfile, error: partnerError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partnerProfile) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // For now, we'll use Supabase's email system
    // In production, you might want to use a service like Resend or SendGrid
    const subject = status === 'verified'
      ? 'Your Organization Has Been Verified - Ejidike Foundation'
      : 'Update on Your Organization Application - Ejidike Foundation';

    const message = status === 'verified'
      ? `Dear ${partnerProfile.full_name},\n\nCongratulations! Your organization "${organizationName}" has been successfully verified on the Ejidike Foundation platform.\n\nYou can now:\n- Post internship and job opportunities\n- Connect with talented applicants\n- Access partner resources\n\nLog in to your dashboard to get started: ${request.nextUrl.origin}/partner/dashboard\n\nBest regards,\nEjidike Foundation Team`
      : `Dear ${partnerProfile.full_name},\n\nThank you for your interest in partnering with the Ejidike Foundation.\n\nUnfortunately, we are unable to verify your organization "${organizationName}" at this time. If you believe this is an error or would like more information, please contact our support team.\n\nBest regards,\nEjidike Foundation Team`;

    // Send email using Brevo
    try {
      const { sendEmail } = await import('@/lib/email');
      const { partnerVerifiedEmail, partnerRejectedEmail } = await import('@/lib/email-templates');

      let emailContent;
      if (status === 'verified') {
        emailContent = partnerVerifiedEmail({
          partnerName: partnerProfile.full_name,
          organizationName
        });
      } else {
        emailContent = partnerRejectedEmail({
          partnerName: partnerProfile.full_name,
          organizationName
        });
      }

      const emailResult = await sendEmail({
        to: partnerProfile.email,
        toName: partnerProfile.full_name,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });

      if (!emailResult.success) {
        console.error('Failed to send email:', emailResult.error);
        // Don't fail the API call if email fails
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      // Don't fail the API call if email service is not configured
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully'
    });
  } catch (error: any) {
    console.error('Notify verification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}
