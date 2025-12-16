/**
 * FILE PATH: /ejdk/ejidike-foundation/lib/email-templates.ts
 * PURPOSE: Email templates for all notification types
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_NAME = 'Ejidike Foundation';
const CURRENT_YEAR = new Date().getFullYear();

// Base email wrapper for consistent styling
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 3px solid #0070f3;">
              <h1 style="margin: 0; color: #0070f3; font-size: 28px; font-weight: bold;">${APP_NAME}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #666; text-align: center;">
                This is an automated email from ${APP_NAME}. Please do not reply to this email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #666; text-align: center;">
                © ${CURRENT_YEAR} ${APP_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Button component
function button(text: string, url: string, color: string = '#0070f3'): string {
  return `
    <a href="${url}"
       style="display: inline-block; padding: 14px 28px; background-color: ${color}; color: #ffffff;
              text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0;">
      ${text}
    </a>
  `;
}

// Alert box component
function alertBox(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): string {
  const colors = {
    success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
    warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
    error: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
    info: { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
  };
  const color = colors[type];

  return `
    <div style="padding: 15px; background-color: ${color.bg}; border-left: 4px solid ${color.border};
                border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0; color: ${color.text}; font-size: 14px;">${message}</p>
    </div>
  `;
}

// Template functions

export function applicationApprovedEmail(params: {
  applicantName: string;
  programTitle: string;
  reviewerNotes?: string;
  applicationId: string;
}): { subject: string; html: string; text: string } {
  const { applicantName, programTitle, reviewerNotes, applicationId } = params;

  const content = `
    <h2 style="color: #28a745; margin: 0 0 20px;">🎉 Congratulations!</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${applicantName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      We're excited to inform you that your application for <strong>${programTitle}</strong> has been <strong>approved</strong>!
    </p>

    ${reviewerNotes ? alertBox(`<strong>Reviewer's Feedback:</strong><br>${reviewerNotes}`, 'success') : ''}

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      Next steps:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li>Review the program details in your dashboard</li>
      <li>Complete any required onboarding steps</li>
      <li>Mark your calendar for the program start date</li>
    </ul>

    ${button('View Application', `${APP_URL}/applications/${applicationId}`, '#28a745')}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      If you have any questions, please don't hesitate to contact us.
    </p>
  `;

  return {
    subject: `Application Approved - ${programTitle}`,
    html: emailWrapper(content),
    text: `Congratulations ${applicantName}!\n\nYour application for ${programTitle} has been approved!\n\n${reviewerNotes ? `Reviewer's Feedback: ${reviewerNotes}\n\n` : ''}View your application: ${APP_URL}/applications/${applicationId}`
  };
}

export function applicationRejectedEmail(params: {
  applicantName: string;
  programTitle: string;
  reviewerNotes?: string;
  applicationId: string;
}): { subject: string; html: string; text: string } {
  const { applicantName, programTitle, reviewerNotes, applicationId } = params;

  const content = `
    <h2 style="color: #333; margin: 0 0 20px;">Application Status Update</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${applicantName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Thank you for your interest in <strong>${programTitle}</strong>. After careful consideration, we regret to inform you that we are unable to approve your application at this time.
    </p>

    ${reviewerNotes ? alertBox(`<strong>Feedback:</strong><br>${reviewerNotes}`, 'warning') : ''}

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      We encourage you to:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li>Review the feedback provided above</li>
      <li>Consider applying to other programs that may be a better fit</li>
      <li>Reapply in future application cycles</li>
    </ul>

    ${button('Browse Other Programs', `${APP_URL}/programs`)}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      Thank you for your understanding. We wish you the best in your future endeavors.
    </p>
  `;

  return {
    subject: `Application Update - ${programTitle}`,
    html: emailWrapper(content),
    text: `Dear ${applicantName},\n\nThank you for your interest in ${programTitle}. We regret to inform you that we are unable to approve your application at this time.\n\n${reviewerNotes ? `Feedback: ${reviewerNotes}\n\n` : ''}View application: ${APP_URL}/applications/${applicationId}`
  };
}

export function moreInfoRequestedEmail(params: {
  applicantName: string;
  programTitle: string;
  reviewerNotes: string;
  applicationId: string;
}): { subject: string; html: string; text: string } {
  const { applicantName, programTitle, reviewerNotes, applicationId } = params;

  const content = `
    <h2 style="color: #ffc107; margin: 0 0 20px;">📋 Additional Information Required</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${applicantName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      We're reviewing your application for <strong>${programTitle}</strong> and need some additional information to proceed.
    </p>

    ${alertBox(`<strong>What we need from you:</strong><br>${reviewerNotes}`, 'warning')}

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      Please provide the requested information at your earliest convenience to avoid delays in processing your application.
    </p>

    ${button('Update Application', `${APP_URL}/applications/${applicationId}`)}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      If you have any questions about what's needed, please contact us.
    </p>
  `;

  return {
    subject: `Action Required - Additional Information Needed for ${programTitle}`,
    html: emailWrapper(content),
    text: `Dear ${applicantName},\n\nWe need additional information for your ${programTitle} application.\n\nWhat we need: ${reviewerNotes}\n\nUpdate application: ${APP_URL}/applications/${applicationId}`
  };
}

export function partnerVerifiedEmail(params: {
  partnerName: string;
  organizationName: string;
}): { subject: string; html: string; text: string } {
  const { partnerName, organizationName } = params;

  const content = `
    <h2 style="color: #28a745; margin: 0 0 20px;">✅ Organization Verified!</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${partnerName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Great news! <strong>${organizationName}</strong> has been successfully verified on the ${APP_NAME} platform.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      You can now:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li>Post internship and job opportunities</li>
      <li>Connect with talented applicants</li>
      <li>Access partner resources and tools</li>
      <li>Collaborate with other verified organizations</li>
    </ul>

    ${button('Go to Dashboard', `${APP_URL}/partner/dashboard`, '#28a745')}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      Welcome to the ${APP_NAME} partner network!
    </p>
  `;

  return {
    subject: `Organization Verified - ${organizationName}`,
    html: emailWrapper(content),
    text: `Dear ${partnerName},\n\nGreat news! ${organizationName} has been verified.\n\nYou can now post opportunities and connect with applicants.\n\nDashboard: ${APP_URL}/partner/dashboard`
  };
}

export function partnerRejectedEmail(params: {
  partnerName: string;
  organizationName: string;
}): { subject: string; html: string; text: string } {
  const { partnerName, organizationName } = params;

  const content = `
    <h2 style="color: #333; margin: 0 0 20px;">Organization Verification Update</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${partnerName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Thank you for your interest in partnering with ${APP_NAME}. After reviewing your organization <strong>${organizationName}</strong>, we are unable to verify it at this time.
    </p>

    ${alertBox('If you believe this is an error or would like more information, please contact our support team.', 'info')}

    ${button('Contact Support', `${APP_URL}/contact`)}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      Thank you for your understanding.
    </p>
  `;

  return {
    subject: `Organization Verification Update - ${organizationName}`,
    html: emailWrapper(content),
    text: `Dear ${partnerName},\n\nWe are unable to verify ${organizationName} at this time.\n\nIf you believe this is an error, please contact support.\n\n${APP_URL}/contact`
  };
}

export function mentorApprovedEmail(params: {
  mentorName: string;
}): { subject: string; html: string; text: string } {
  const { mentorName } = params;

  const content = `
    <h2 style="color: #28a745; margin: 0 0 20px;">🎉 Welcome to the Mentor Network!</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${mentorName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Congratulations! Your mentor application has been <strong>approved</strong>. We're excited to have you join our mentorship program!
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      As a mentor, you can:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li>Guide and support mentees in their journey</li>
      <li>Share your expertise and experience</li>
      <li>Make a lasting impact on the next generation</li>
      <li>Track your mentorship sessions and progress</li>
    </ul>

    ${button('Complete Your Mentor Profile', `${APP_URL}/mentor/profile`, '#28a745')}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      Thank you for dedicating your time to mentoring. Together, we can make a difference!
    </p>
  `;

  return {
    subject: 'Mentor Application Approved - Welcome!',
    html: emailWrapper(content),
    text: `Dear ${mentorName},\n\nCongratulations! Your mentor application has been approved.\n\nComplete your profile: ${APP_URL}/mentor/profile`
  };
}

export function mentorRejectedEmail(params: {
  mentorName: string;
  adminNotes?: string;
}): { subject: string; html: string; text: string } {
  const { mentorName, adminNotes } = params;

  const content = `
    <h2 style="color: #333; margin: 0 0 20px;">Mentor Application Update</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${mentorName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Thank you for your interest in becoming a mentor with ${APP_NAME}. After careful review, we are unable to approve your mentor application at this time.
    </p>

    ${adminNotes ? alertBox(`<strong>Feedback:</strong><br>${adminNotes}`, 'info') : ''}

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      This doesn't diminish your qualifications. You may:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li>Reapply in the future when requirements change</li>
      <li>Participate in other ways (programs, partnerships)</li>
      <li>Contact us for more information</li>
    </ul>

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      We appreciate your interest in supporting others through mentorship.
    </p>
  `;

  return {
    subject: 'Mentor Application Update',
    html: emailWrapper(content),
    text: `Dear ${mentorName},\n\nThank you for your interest in becoming a mentor. We are unable to approve your application at this time.\n\n${adminNotes ? `Feedback: ${adminNotes}\n\n` : ''}You may reapply in the future.`
  };
}

export function newApplicationNotificationEmail(params: {
  adminName: string;
  applicantName: string;
  programTitle: string;
  applicationId: string;
}): { subject: string; html: string; text: string } {
  const { adminName, applicantName, programTitle, applicationId } = params;

  const content = `
    <h2 style="color: #0070f3; margin: 0 0 20px;">📬 New Application Received</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Hello ${adminName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      A new application has been submitted and is ready for your review.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Applicant:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${applicantName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Program:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${programTitle}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Status:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">Pending Review</td>
      </tr>
    </table>

    ${button('Review Application', `${APP_URL}/admin/dashboard/applications/${applicationId}`)}
  `;

  return {
    subject: `New Application - ${applicantName} for ${programTitle}`,
    html: emailWrapper(content),
    text: `New Application Received\n\nApplicant: ${applicantName}\nProgram: ${programTitle}\nStatus: Pending Review\n\nReview: ${APP_URL}/admin/dashboard/applications/${applicationId}`
  };
}

// Mentorship email templates

export function mentorshipRequestReceivedEmail(params: {
  mentorName: string;
  menteeName: string;
  menteeEmail: string;
  menteeBio?: string;
}): { subject: string; html: string; text: string } {
  const { mentorName, menteeName, menteeEmail, menteeBio } = params;

  const content = `
    <h2 style="color: #0070f3; margin: 0 0 20px;">🤝 New Mentorship Request</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${mentorName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      You have received a new mentorship request from <strong>${menteeName}</strong>!
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8f9fa; border-radius: 6px;">
      <tr>
        <td style="padding: 10px;"><strong>Mentee Name:</strong></td>
        <td style="padding: 10px;">${menteeName}</td>
      </tr>
      <tr>
        <td style="padding: 10px;"><strong>Email:</strong></td>
        <td style="padding: 10px;">${menteeEmail}</td>
      </tr>
    </table>

    ${menteeBio ? `
      <div style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 5px; font-weight: 600; color: #333;">About ${menteeName}:</p>
        <p style="margin: 0; color: #666; font-size: 14px;">${menteeBio}</p>
      </div>
    ` : ''}

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      Please review this request and respond at your earliest convenience.
    </p>

    ${button('View Request & Respond', `${APP_URL}/mentor/mentees`)}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      Thank you for being part of our mentorship program!
    </p>
  `;

  return {
    subject: `New Mentorship Request from ${menteeName}`,
    html: emailWrapper(content),
    text: `Dear ${mentorName},\n\nYou have received a new mentorship request from ${menteeName} (${menteeEmail}).\n\n${menteeBio ? `About ${menteeName}: ${menteeBio}\n\n` : ''}Please review and respond: ${APP_URL}/mentor/mentees`
  };
}

export function mentorshipRequestSentEmail(params: {
  menteeName: string;
  mentorName: string;
}): { subject: string; html: string; text: string } {
  const { menteeName, mentorName } = params;

  const content = `
    <h2 style="color: #28a745; margin: 0 0 20px;">✅ Mentorship Request Sent</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${menteeName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Your mentorship request to <strong>${mentorName}</strong> has been successfully sent!
    </p>

    ${alertBox('Your request is now pending review. The mentor will be notified and will respond soon.', 'success')}

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      What happens next:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li>The mentor will review your request</li>
      <li>You'll receive a notification when they respond</li>
      <li>If accepted, you can start scheduling sessions</li>
    </ul>

    ${button('View Mentorship Status', `${APP_URL}/mentorship`)}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      We'll keep you updated on the status of your request.
    </p>
  `;

  return {
    subject: `Mentorship Request Sent to ${mentorName}`,
    html: emailWrapper(content),
    text: `Dear ${menteeName},\n\nYour mentorship request to ${mentorName} has been sent!\n\nThe mentor will review your request and respond soon. You'll receive a notification when they respond.\n\nView status: ${APP_URL}/mentorship`
  };
}

export function mentorshipRequestAcceptedEmail(params: {
  menteeName: string;
  mentorName: string;
  mentorEmail: string;
}): { subject: string; html: string; text: string } {
  const { menteeName, mentorName, mentorEmail } = params;

  const content = `
    <h2 style="color: #28a745; margin: 0 0 20px;">🎉 Mentorship Request Accepted!</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${menteeName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Great news! <strong>${mentorName}</strong> has accepted your mentorship request!
    </p>

    ${alertBox('Your mentorship has been officially matched. You can now start your mentorship journey!', 'success')}

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Your Mentor:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${mentorName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Contact:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${mentorEmail}</td>
      </tr>
    </table>

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      Next steps:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li>Reach out to your mentor to introduce yourself</li>
      <li>Schedule your first mentorship session</li>
      <li>Set goals for your mentorship journey</li>
    </ul>

    ${button('View Mentorship', `${APP_URL}/mentorship`, '#28a745')}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      Congratulations on starting your mentorship journey!
    </p>
  `;

  return {
    subject: `Mentorship Request Accepted by ${mentorName}`,
    html: emailWrapper(content),
    text: `Dear ${menteeName},\n\nGreat news! ${mentorName} has accepted your mentorship request!\n\nMentor Contact: ${mentorEmail}\n\nNext steps:\n- Reach out to introduce yourself\n- Schedule your first session\n- Set goals for your mentorship\n\nView mentorship: ${APP_URL}/mentorship`
  };
}

export function mentorshipRequestRejectedEmail(params: {
  menteeName: string;
  mentorName: string;
}): { subject: string; html: string; text: string } {
  const { menteeName, mentorName } = params;

  const content = `
    <h2 style="color: #333; margin: 0 0 20px;">Mentorship Request Update</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${menteeName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Thank you for your interest in mentorship with <strong>${mentorName}</strong>. Unfortunately, the mentor is unable to accept your request at this time.
    </p>

    ${alertBox('This may be due to capacity constraints or other commitments. We encourage you to request mentorship from other available mentors.', 'info')}

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      What you can do:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li>Browse and connect with other available mentors</li>
      <li>Review mentor profiles to find the best match</li>
      <li>Try requesting again in the future</li>
    </ul>

    ${button('Find Other Mentors', `${APP_URL}/mentorship`)}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      Don't be discouraged - the right mentor match is out there for you!
    </p>
  `;

  return {
    subject: `Mentorship Request Update from ${mentorName}`,
    html: emailWrapper(content),
    text: `Dear ${menteeName},\n\nThe mentor ${mentorName} is unable to accept your mentorship request at this time.\n\nThis may be due to capacity or other commitments. We encourage you to connect with other available mentors.\n\nFind mentors: ${APP_URL}/mentorship`
  };
}

// Email verification template
export function emailVerificationEmail(params: {
  userName: string;
  verificationUrl: string;
  expiresIn: string;
}): { subject: string; html: string; text: string } {
  const { userName, verificationUrl, expiresIn } = params;

  const content = `
    <h2 style="color: #0070f3; margin: 0 0 20px;">📧 Verify Your Email Address</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Thank you for registering with ${APP_NAME}! Please verify your email address to complete your registration and access all features.
    </p>

    ${alertBox(`This verification link will expire in ${expiresIn}. If it expires, you can request a new one from the login page.`, 'info')}

    <div style="text-align: center; margin: 30px 0;">
      ${button('Verify Email Address', verificationUrl, '#28a745')}
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 20px 0 0;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="font-size: 12px; line-height: 1.6; color: #0070f3; word-break: break-all; margin: 10px 0;">
      ${verificationUrl}
    </p>

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      If you didn't create an account with us, please ignore this email.
    </p>
  `;

  return {
    subject: `Verify Your Email - ${APP_NAME}`,
    html: emailWrapper(content),
    text: `Hi ${userName},\n\nThank you for registering with ${APP_NAME}! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in ${expiresIn}.\n\nIf you didn't create an account, please ignore this email.`
  };
}

// Resend verification email template
export function resendVerificationEmail(params: {
  userName: string;
  verificationUrl: string;
  expiresIn: string;
}): { subject: string; html: string; text: string } {
  const { userName, verificationUrl, expiresIn } = params;

  const content = `
    <h2 style="color: #0070f3; margin: 0 0 20px;">📧 New Verification Link</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      You requested a new email verification link. Click the button below to verify your email address.
    </p>

    ${alertBox(`This new link will expire in ${expiresIn}.`, 'info')}

    <div style="text-align: center; margin: 30px 0;">
      ${button('Verify Email Address', verificationUrl, '#28a745')}
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 20px 0 0;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="font-size: 12px; line-height: 1.6; color: #0070f3; word-break: break-all; margin: 10px 0;">
      ${verificationUrl}
    </p>
  `;

  return {
    subject: `New Verification Link - ${APP_NAME}`,
    html: emailWrapper(content),
    text: `Hi ${userName},\n\nHere's your new verification link:\n\n${verificationUrl}\n\nThis link will expire in ${expiresIn}.`
  };
}
