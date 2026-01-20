/**
 * FILE PATH: /app/api/admin/email-templates/route.ts
 * PURPOSE: API route for previewing email templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import * as templates from '@/lib/email-templates';

// Sample data for previewing templates
const sampleData = {
  applicantName: 'John Doe',
  mentorName: 'Dr. Sarah Johnson',
  partnerName: 'Michael Smith',
  menteeName: 'Jane Doe',
  adminName: 'Admin User',
  programTitle: 'Youth Entrepreneurship Grant 2024',
  organizationName: 'TechStart Nigeria',
  applicationId: 'app-123456',
  partnerId: 'partner-123456',
  reviewerNotes: 'Great application! Your passion for entrepreneurship really shines through. We look forward to supporting your journey.',
  rejectionReason: 'Unfortunately, your organization did not meet our minimum requirements for verified partners at this time.',
  adminNotes: 'Please consider applying again after gaining more relevant experience in your field.',
  mentorEmail: 'mentor@example.com',
  menteeEmail: 'mentee@example.com',
  partnerEmail: 'partner@example.com',
  menteeBio: 'I am a passionate software developer looking to grow my skills and learn from experienced professionals in the tech industry.',
  verificationUrl: 'https://ejidikefoundation.com/verify-email?token=sample-token-123',
  expiresIn: '24 hours',
  userName: 'New User',
  reason: 'Compliance issues were found during our periodic review of partner organizations.',
};

// Template definitions with metadata
const templateDefinitions = [
  {
    id: 'applicationApproved',
    name: 'Application Approved',
    category: 'Applications',
    description: 'Sent when an application is approved',
    generator: () => templates.applicationApprovedEmail({
      applicantName: sampleData.applicantName,
      programTitle: sampleData.programTitle,
      reviewerNotes: sampleData.reviewerNotes,
      applicationId: sampleData.applicationId,
    }),
  },
  {
    id: 'applicationRejected',
    name: 'Application Rejected',
    category: 'Applications',
    description: 'Sent when an application is rejected',
    generator: () => templates.applicationRejectedEmail({
      applicantName: sampleData.applicantName,
      programTitle: sampleData.programTitle,
      reviewerNotes: sampleData.reviewerNotes,
      applicationId: sampleData.applicationId,
    }),
  },
  {
    id: 'moreInfoRequested',
    name: 'More Information Requested',
    category: 'Applications',
    description: 'Sent when additional information is needed',
    generator: () => templates.moreInfoRequestedEmail({
      applicantName: sampleData.applicantName,
      programTitle: sampleData.programTitle,
      reviewerNotes: sampleData.reviewerNotes,
      applicationId: sampleData.applicationId,
    }),
  },
  {
    id: 'newApplicationNotification',
    name: 'New Application (Admin)',
    category: 'Applications',
    description: 'Sent to admins when new application is submitted',
    generator: () => templates.newApplicationNotificationEmail({
      adminName: sampleData.adminName,
      applicantName: sampleData.applicantName,
      programTitle: sampleData.programTitle,
      applicationId: sampleData.applicationId,
    }),
  },
  {
    id: 'partnerVerified',
    name: 'Partner Verified',
    category: 'Partners',
    description: 'Sent when partner organization is verified',
    generator: () => templates.partnerVerifiedEmail({
      partnerName: sampleData.partnerName,
      organizationName: sampleData.organizationName,
    }),
  },
  {
    id: 'partnerRejected',
    name: 'Partner Rejected',
    category: 'Partners',
    description: 'Sent when partner organization is rejected',
    generator: () => templates.partnerRejectedEmail({
      partnerName: sampleData.partnerName,
      organizationName: sampleData.organizationName,
      rejectionReason: sampleData.rejectionReason,
    }),
  },
  {
    id: 'partnerVerificationRescinded',
    name: 'Partner Verification Rescinded',
    category: 'Partners',
    description: 'Sent when partner verification is rescinded',
    generator: () => templates.partnerVerificationRescindedEmail({
      partnerName: sampleData.partnerName,
      organizationName: sampleData.organizationName,
      reason: sampleData.reason,
    }),
  },
  {
    id: 'newPartnerSignup',
    name: 'New Partner Signup (Admin)',
    category: 'Partners',
    description: 'Sent to admins when new partner signs up',
    generator: () => templates.newPartnerSignupEmail({
      adminName: sampleData.adminName,
      partnerName: sampleData.partnerName,
      partnerEmail: sampleData.partnerEmail,
      organizationName: sampleData.organizationName,
      partnerId: sampleData.partnerId,
    }),
  },
  {
    id: 'applicantWelcome',
    name: 'Applicant Welcome',
    category: 'Welcome',
    description: 'Sent to new applicants after signup',
    generator: () => templates.applicantWelcomeEmail({
      applicantName: sampleData.applicantName,
    }),
  },
  {
    id: 'mentorWelcome',
    name: 'Mentor Welcome',
    category: 'Welcome',
    description: 'Sent to new mentors after signup',
    generator: () => templates.mentorWelcomeEmail({
      mentorName: sampleData.mentorName,
    }),
  },
  {
    id: 'partnerWelcome',
    name: 'Partner Welcome',
    category: 'Welcome',
    description: 'Sent to new partners after signup',
    generator: () => templates.partnerWelcomeEmail({
      partnerName: sampleData.partnerName,
    }),
  },
  {
    id: 'mentorApproved',
    name: 'Mentor Approved',
    category: 'Mentors',
    description: 'Sent when mentor application is approved',
    generator: () => templates.mentorApprovedEmail({
      mentorName: sampleData.mentorName,
    }),
  },
  {
    id: 'mentorRejected',
    name: 'Mentor Rejected',
    category: 'Mentors',
    description: 'Sent when mentor application is rejected',
    generator: () => templates.mentorRejectedEmail({
      mentorName: sampleData.mentorName,
      adminNotes: sampleData.adminNotes,
    }),
  },
  {
    id: 'mentorshipRequestReceived',
    name: 'Mentorship Request Received',
    category: 'Mentorship',
    description: 'Sent to mentor when they receive a request',
    generator: () => templates.mentorshipRequestReceivedEmail({
      mentorName: sampleData.mentorName,
      menteeName: sampleData.menteeName,
      menteeEmail: sampleData.menteeEmail,
      menteeBio: sampleData.menteeBio,
    }),
  },
  {
    id: 'mentorshipRequestSent',
    name: 'Mentorship Request Sent',
    category: 'Mentorship',
    description: 'Sent to mentee confirming request was sent',
    generator: () => templates.mentorshipRequestSentEmail({
      menteeName: sampleData.menteeName,
      mentorName: sampleData.mentorName,
    }),
  },
  {
    id: 'mentorshipRequestAccepted',
    name: 'Mentorship Request Accepted',
    category: 'Mentorship',
    description: 'Sent to mentee when mentor accepts',
    generator: () => templates.mentorshipRequestAcceptedEmail({
      menteeName: sampleData.menteeName,
      mentorName: sampleData.mentorName,
      mentorEmail: sampleData.mentorEmail,
    }),
  },
  {
    id: 'mentorshipRequestRejected',
    name: 'Mentorship Request Rejected',
    category: 'Mentorship',
    description: 'Sent to mentee when mentor declines',
    generator: () => templates.mentorshipRequestRejectedEmail({
      menteeName: sampleData.menteeName,
      mentorName: sampleData.mentorName,
    }),
  },
  {
    id: 'emailVerification',
    name: 'Email Verification',
    category: 'Authentication',
    description: 'Sent to verify user email after signup',
    generator: () => templates.emailVerificationEmail({
      userName: sampleData.userName,
      verificationUrl: sampleData.verificationUrl,
      expiresIn: sampleData.expiresIn,
    }),
  },
  {
    id: 'resendVerification',
    name: 'Resend Verification',
    category: 'Authentication',
    description: 'Sent when user requests new verification link',
    generator: () => templates.resendVerificationEmail({
      userName: sampleData.userName,
      verificationUrl: sampleData.verificationUrl,
      expiresIn: sampleData.expiresIn,
    }),
  },
];

export async function GET(request: NextRequest) {
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
      .order('created_at', { ascending: false })
      .limit(1);

    if (!profile || profile.length === 0 || profile[0].role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check for specific template request
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (templateId) {
      // Return single template preview
      const template = templateDefinitions.find(t => t.id === templateId);
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      const generated = template.generator();
      return NextResponse.json({
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        subject: generated.subject,
        html: generated.html,
        text: generated.text,
      });
    }

    // Return list of all templates
    const templateList = templateDefinitions.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
    }));

    // Group by category
    const categories = [...new Set(templateDefinitions.map(t => t.category))];
    const grouped = categories.map(category => ({
      category,
      templates: templateList.filter(t => t.category === category),
    }));

    return NextResponse.json({
      templates: templateList,
      grouped,
      totalCount: templateList.length,
    });
  } catch (error: any) {
    console.error('Email templates API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
