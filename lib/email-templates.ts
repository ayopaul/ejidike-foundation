/**
 * FILE PATH: /ejdk/ejidike-foundation/lib/email-templates.ts
 * PURPOSE: Email templates for all notification types
 * TEMPLATE: Based on Postmark's professional email templates
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_NAME = 'Ejidike Foundation';
const CURRENT_YEAR = new Date().getFullYear();
const BRAND_COLOR = '#0070f3';
const SUPPORT_EMAIL = 'support@ejidikefoundation.com';
const LOGO_URL = `${APP_URL}/images/logos/logo.webp`;

// Professional email wrapper based on Postmark template
function emailWrapper(content: string, preheader: string = ''): string {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${APP_NAME}</title>
    <style type="text/css" rel="stylesheet" media="all">
    @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");

    body {
      width: 100% !important;
      height: 100%;
      margin: 0;
      -webkit-text-size-adjust: none;
      background-color: #F2F4F6;
      color: #51545E;
    }

    a { color: ${BRAND_COLOR}; }
    a img { border: none; }
    td { word-break: break-word; }

    .preheader {
      display: none !important;
      visibility: hidden;
      mso-hide: all;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }

    body, td, th {
      font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
    }

    h1 {
      margin-top: 0;
      color: #333333;
      font-size: 22px;
      font-weight: bold;
      text-align: left;
    }

    h2 {
      margin-top: 0;
      color: #333333;
      font-size: 16px;
      font-weight: bold;
      text-align: left;
    }

    p, ul, ol {
      margin: .4em 0 1.1875em;
      font-size: 16px;
      line-height: 1.625;
      color: #51545E;
    }

    .button {
      background-color: ${BRAND_COLOR};
      border-top: 10px solid ${BRAND_COLOR};
      border-right: 18px solid ${BRAND_COLOR};
      border-bottom: 10px solid ${BRAND_COLOR};
      border-left: 18px solid ${BRAND_COLOR};
      display: inline-block;
      color: #FFF !important;
      text-decoration: none;
      border-radius: 3px;
      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
      -webkit-text-size-adjust: none;
      box-sizing: border-box;
    }

    .button--green {
      background-color: #22BC66;
      border-color: #22BC66;
    }

    .button--red {
      background-color: #FF6136;
      border-color: #FF6136;
    }

    .attributes {
      margin: 0 0 21px;
    }

    .attributes_content {
      background-color: #F4F4F7;
      padding: 16px;
    }

    .attributes_item {
      padding: 0;
    }

    .email-wrapper {
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #F2F4F6;
    }

    .email-masthead {
      padding: 25px 0;
      text-align: center;
    }

    .email-masthead_name {
      font-size: 16px;
      font-weight: bold;
      color: #A8AAAF;
      text-decoration: none;
      text-shadow: 0 1px 0 white;
    }

    .email-body {
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .email-body_inner {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      background-color: #FFFFFF;
    }

    .email-footer {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      text-align: center;
    }

    .email-footer p {
      color: #A8AAAF;
    }

    .body-action {
      width: 100%;
      margin: 30px auto;
      padding: 0;
      text-align: center;
    }

    .body-sub {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid #EAEAEC;
    }

    .content-cell {
      padding: 45px;
    }

    .f-fallback { font-family: Arial, sans-serif; }

    @media only screen and (max-width: 600px) {
      .email-body_inner, .email-footer { width: 100% !important; }
    }

    @media only screen and (max-width: 500px) {
      .button { width: 100% !important; text-align: center !important; }
    }

    @media (prefers-color-scheme: dark) {
      body, .email-body, .email-body_inner, .email-content, .email-wrapper, .email-masthead, .email-footer {
        background-color: #333333 !important;
        color: #FFF !important;
      }
      p, ul, ol, h1, h2, h3, span { color: #FFF !important; }
      .attributes_content { background-color: #222 !important; }
      .email-masthead_name { text-shadow: none !important; }
    }
    </style>
  </head>
  <body>
    <span class="preheader">${preheader}</span>
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td class="email-masthead">
                <a href="${APP_URL}" style="display: inline-block;">
                  <img src="${LOGO_URL}" alt="${APP_NAME}" width="150" height="auto" style="max-width: 150px; height: auto; border: 0; display: block;" />
                </a>
              </td>
            </tr>
            <tr>
              <td class="email-body" width="570" cellpadding="0" cellspacing="0">
                <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td class="content-cell">
                      <div class="f-fallback">
                        ${content}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td class="content-cell" align="center">
                      <p class="f-fallback sub align-center">
                        ${APP_NAME}
                        <br>Empowering Nigeria's Youth to Learn, Lead & Innovate
                      </p>
                      <p class="f-fallback sub align-center" style="font-size: 12px;">
                        © ${CURRENT_YEAR} ${APP_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
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

// Button component (Postmark bulletproof button style)
function button(text: string, url: string, color: string = BRAND_COLOR): string {
  const colorClass = color === '#22BC66' ? 'button--green' : color === '#FF6136' ? 'button--red' : '';
  return `
    <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td align="center">
                <a href="${url}" class="f-fallback button ${colorClass}" target="_blank" style="background-color: ${color}; border-color: ${color};">${text}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

// Info box / attributes component
function alertBox(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): string {
  const colors = {
    success: { bg: '#d4edda', border: '#22BC66', text: '#155724' },
    warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
    error: { bg: '#f8d7da', border: '#FF6136', text: '#721c24' },
    info: { bg: '#F4F4F7', border: BRAND_COLOR, text: '#51545E' }
  };
  const c = colors[type];

  return `
    <table class="attributes" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td class="attributes_content" style="background-color: ${c.bg}; border-left: 4px solid ${c.border}; padding: 16px;">
          <p style="margin: 0; color: ${c.text}; font-size: 14px;">${message}</p>
        </td>
      </tr>
    </table>
  `;
}

// Attributes/Info list component
function attributesList(items: { label: string; value: string }[]): string {
  const rows = items.map(item => `
    <tr>
      <td class="attributes_item">
        <span class="f-fallback"><strong>${item.label}:</strong> ${item.value}</span>
      </td>
    </tr>
  `).join('');

  return `
    <table class="attributes" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td class="attributes_content">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            ${rows}
          </table>
        </td>
      </tr>
    </table>
  `;
}

// Sub-copy component for fallback URLs
function subCopy(text: string, url: string): string {
  return `
    <table class="body-sub" role="presentation">
      <tr>
        <td>
          <p class="f-fallback sub" style="font-size: 13px; color: #A8AAAF;">${text}</p>
          <p class="f-fallback sub" style="font-size: 13px; color: #A8AAAF;">${url}</p>
        </td>
      </tr>
    </table>
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
  rejectionReason?: string;
}): { subject: string; html: string; text: string } {
  const { partnerName, organizationName, rejectionReason } = params;

  const content = `
    <h2 style="color: #333; margin: 0 0 20px;">Organization Verification Update</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${partnerName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Thank you for your interest in partnering with ${APP_NAME}. After reviewing your organization <strong>${organizationName}</strong>, we are unable to verify it at this time.
    </p>

    ${rejectionReason ? alertBox(`<strong>Reason:</strong><br>${rejectionReason}`, 'warning') : ''}

    ${alertBox('If you believe this is an error or would like more information, please contact our support team.', 'info')}

    ${button('Contact Support', `${APP_URL}/contact`)}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      Thank you for your understanding.
    </p>
  `;

  return {
    subject: `Organization Verification Update - ${organizationName}`,
    html: emailWrapper(content),
    text: `Dear ${partnerName},\n\nWe are unable to verify ${organizationName} at this time.\n\n${rejectionReason ? `Reason: ${rejectionReason}\n\n` : ''}If you believe this is an error, please contact support.\n\n${APP_URL}/contact`
  };
}

// Applicant welcome email - sent after signup
export function applicantWelcomeEmail(params: {
  applicantName: string;
}): { subject: string; html: string; text: string } {
  const { applicantName } = params;

  const content = `
    <h2 style="color: #0070f3; margin: 0 0 20px;">🎓 Welcome to ${APP_NAME}!</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${applicantName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Thank you for joining ${APP_NAME}! We're thrilled to have you as part of our community of learners and future leaders.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      Here's what you can do on our platform:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li><strong>Browse Programs:</strong> Explore educational and business grant opportunities</li>
      <li><strong>Apply for Grants:</strong> Submit applications for programs that match your goals</li>
      <li><strong>Find a Mentor:</strong> Connect with experienced professionals for guidance</li>
      <li><strong>Discover Opportunities:</strong> Access internships, apprenticeships, and more</li>
    </ul>

    ${alertBox('Complete your profile to increase your chances of being selected for programs and matched with mentors.', 'info')}

    ${button('Explore Programs', `${APP_URL}/browse-programs`, '#28a745')}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      We're here to support your journey. If you have any questions, don't hesitate to reach out!
    </p>
  `;

  return {
    subject: `Welcome to ${APP_NAME} - Your Journey Starts Here!`,
    html: emailWrapper(content),
    text: `Dear ${applicantName},\n\nWelcome to ${APP_NAME}!\n\nHere's what you can do:\n- Browse Programs: Explore educational and business grant opportunities\n- Apply for Grants: Submit applications for programs that match your goals\n- Find a Mentor: Connect with experienced professionals\n- Discover Opportunities: Access internships and more\n\nExplore programs: ${APP_URL}/browse-programs`
  };
}

// Mentor welcome email - sent after signup
export function mentorWelcomeEmail(params: {
  mentorName: string;
}): { subject: string; html: string; text: string } {
  const { mentorName } = params;

  const content = `
    <h2 style="color: #0070f3; margin: 0 0 20px;">🌟 Welcome to ${APP_NAME}!</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${mentorName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Thank you for your interest in becoming a mentor with ${APP_NAME}! Your willingness to guide and support the next generation is truly appreciated.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      To get started as a mentor, please follow these steps:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li><strong>Step 1:</strong> Complete your mentor profile with your expertise and experience</li>
      <li><strong>Step 2:</strong> Submit your profile for review by our team</li>
      <li><strong>Step 3:</strong> Once approved, start receiving mentorship requests!</li>
    </ul>

    ${alertBox('Your mentor profile will be reviewed by our team to ensure the best experience for mentees. This typically takes 1-2 business days.', 'info')}

    ${button('Complete Mentor Profile', `${APP_URL}/mentor/profile`)}

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      As a mentor, you'll be able to:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li>Guide mentees through their personal and professional development</li>
      <li>Share your knowledge and industry insights</li>
      <li>Make a lasting impact on someone's career journey</li>
      <li>Join a community of like-minded professionals</li>
    </ul>

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      Thank you for choosing to make a difference. We look forward to having you on board!
    </p>
  `;

  return {
    subject: `Welcome to ${APP_NAME} - Thank You for Becoming a Mentor!`,
    html: emailWrapper(content),
    text: `Dear ${mentorName},\n\nWelcome to ${APP_NAME}!\n\nTo get started as a mentor:\n1. Complete your mentor profile with your expertise\n2. Submit your profile for review (1-2 business days)\n3. Once approved, start receiving mentorship requests!\n\nComplete profile: ${APP_URL}/mentor/profile`
  };
}

// Partner welcome email - sent after signup
export function partnerWelcomeEmail(params: {
  partnerName: string;
}): { subject: string; html: string; text: string } {
  const { partnerName } = params;

  const content = `
    <h2 style="color: #0070f3; margin: 0 0 20px;">🤝 Welcome to ${APP_NAME}!</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${partnerName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Thank you for registering as a partner with ${APP_NAME}! We're excited to have you join our network of organizations making a difference.
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      To get started, please complete the following steps:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li><strong>Step 1:</strong> Complete your organization profile</li>
      <li><strong>Step 2:</strong> Submit for verification (typically 1-2 business days)</li>
      <li><strong>Step 3:</strong> Once verified, start posting opportunities!</li>
    </ul>

    ${alertBox('Your organization must be verified before you can post opportunities. Our team reviews all partner applications to ensure quality.', 'info')}

    ${button('Complete Organization Profile', `${APP_URL}/partner/organization`)}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      If you have any questions, feel free to contact our support team.
    </p>
  `;

  return {
    subject: `Welcome to ${APP_NAME} Partner Network!`,
    html: emailWrapper(content),
    text: `Dear ${partnerName},\n\nWelcome to ${APP_NAME}!\n\nTo get started:\n1. Complete your organization profile\n2. Submit for verification (1-2 business days)\n3. Once verified, start posting opportunities!\n\nComplete profile: ${APP_URL}/partner/organization`
  };
}

// Admin notification for new partner signup
export function newPartnerSignupEmail(params: {
  adminName: string;
  partnerName: string;
  partnerEmail: string;
  organizationName: string;
  partnerId: string;
}): { subject: string; html: string; text: string } {
  const { adminName, partnerName, partnerEmail, organizationName, partnerId } = params;

  const content = `
    <h2 style="color: #0070f3; margin: 0 0 20px;">🏢 New Partner Verification Request</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Hello ${adminName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      A new partner organization has submitted their profile for verification.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Organization:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${organizationName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Contact Person:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${partnerName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${partnerEmail}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Status:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">Pending Verification</td>
      </tr>
    </table>

    ${button('Review Partner', `${APP_URL}/admin/partners/${partnerId}`)}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      Please review this partner application at your earliest convenience.
    </p>
  `;

  return {
    subject: `New Partner Verification - ${organizationName}`,
    html: emailWrapper(content),
    text: `New Partner Verification Request\n\nOrganization: ${organizationName}\nContact: ${partnerName} (${partnerEmail})\nStatus: Pending Verification\n\nReview: ${APP_URL}/admin/partners/${partnerId}`
  };
}

// Partner verification rescinded email
export function partnerVerificationRescindedEmail(params: {
  partnerName: string;
  organizationName: string;
  reason?: string;
}): { subject: string; html: string; text: string } {
  const { partnerName, organizationName, reason } = params;

  const content = `
    <h2 style="color: #dc3545; margin: 0 0 20px;">⚠️ Organization Verification Status Update</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      Dear ${partnerName},
    </p>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px;">
      We regret to inform you that the verification status for <strong>${organizationName}</strong> has been rescinded and is now pending re-verification.
    </p>

    ${reason ? alertBox(`<strong>Reason:</strong><br>${reason}`, 'warning') : ''}

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0 15px;">
      What this means:
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 20px; padding-left: 20px;">
      <li>Your organization is now in pending status</li>
      <li>You cannot create new opportunities until re-verified</li>
      <li>Existing opportunities remain visible but may be reviewed</li>
    </ul>

    ${alertBox('Please contact our support team if you have questions or need to provide additional information.', 'info')}

    ${button('Contact Support', `${APP_URL}/contact`)}

    <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 30px 0 0;">
      We appreciate your understanding and cooperation.
    </p>
  `;

  return {
    subject: `Verification Status Update - ${organizationName}`,
    html: emailWrapper(content),
    text: `Dear ${partnerName},\n\nThe verification status for ${organizationName} has been rescinded.\n\n${reason ? `Reason: ${reason}\n\n` : ''}Your organization is now pending re-verification. Please contact support if you have questions.\n\n${APP_URL}/contact`
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
