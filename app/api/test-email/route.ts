/**
 * Test email endpoint - Visit /api/test-email to send a test email
 * This will help verify your Brevo integration is working
 */

import { NextResponse } from 'next/server';
import { sendEmail, isEmailConfigured } from '@/lib/email';
import { applicationApprovedEmail } from '@/lib/email-templates';

export async function GET() {
  try {
    // Check if email is configured
    if (!isEmailConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured',
        help: 'Please add BREVO_API_KEY and BREVO_FROM_EMAIL to your .env.local file'
      }, { status: 500 });
    }

    // Get the from email to send test to yourself
    const testEmail = process.env.BREVO_FROM_EMAIL!;

    console.log('Sending test email to:', testEmail);

    // Send a simple test email
    const result = await sendEmail({
      to: testEmail,
      toName: 'Test User',
      subject: '✅ Brevo Test - Ejidike Foundation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f5f5f5;">
          <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #28a745; margin: 0 0 20px;">🎉 Success!</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Your Brevo email integration is <strong>working perfectly!</strong>
            </p>

            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 20px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>✅ Email service configured</strong></p>
              <p style="margin: 5px 0;"><strong>✅ API key working</strong></p>
              <p style="margin: 5px 0;"><strong>✅ Sender verified</strong></p>
              <p style="margin: 5px 0;"><strong>✅ Ready to send notifications</strong></p>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This is a test email from your Ejidike Foundation platform.<br>
              Time sent: ${new Date().toLocaleString()}
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} Ejidike Foundation. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `Success! Your Brevo email integration is working.\n\n✅ Email service configured\n✅ API key working\n✅ Sender verified\n✅ Ready to send notifications\n\nTime sent: ${new Date().toLocaleString()}`
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '✅ Test email sent successfully!',
        details: {
          to: testEmail,
          messageId: result.messageId,
          timestamp: new Date().toISOString()
        },
        instructions: [
          `Check your inbox: ${testEmail}`,
          'Also check spam/junk folder',
          'Email should arrive within 1-2 minutes',
          'Check Brevo dashboard for delivery status: https://app.brevo.com/statistics/email'
        ]
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        troubleshooting: [
          'Check that your BREVO_API_KEY is correct in .env.local',
          'Verify sender email is verified in Brevo dashboard',
          'Check Brevo dashboard for error logs: https://app.brevo.com/',
          'Make sure you restarted the dev server after adding env variables'
        ]
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test email',
      details: error
    }, { status: 500 });
  }
}

// Also test with a real template
export async function POST() {
  try {
    if (!isEmailConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured'
      }, { status: 500 });
    }

    const testEmail = process.env.BREVO_FROM_EMAIL!;

    // Test with actual application approved template
    const emailContent = applicationApprovedEmail({
      applicantName: 'Test User',
      programTitle: 'Test Program - Email Template Demo',
      reviewerNotes: 'This is a test of the application approval email template. Your actual notifications will look like this!',
      applicationId: 'test-123'
    });

    const result = await sendEmail({
      to: testEmail,
      toName: 'Test User',
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '✅ Template test email sent!',
        details: {
          template: 'Application Approved',
          to: testEmail,
          messageId: result.messageId
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
