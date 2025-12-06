/**
 * FILE PATH: /ejdk/ejidike-foundation/lib/email.ts
 * PURPOSE: Email service using Brevo (Sendinblue)
 */

import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ''
);

export interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send an email using Brevo
 */
export async function sendEmail({
  to,
  toName,
  subject,
  html,
  text,
  replyTo
}: SendEmailParams): Promise<{ success: boolean; error?: any; messageId?: string }> {
  try {
    // Validate required environment variables
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY is not set');
      return { success: false, error: 'Email service not configured' };
    }

    if (!process.env.BREVO_FROM_EMAIL) {
      console.error('BREVO_FROM_EMAIL is not set');
      return { success: false, error: 'Email sender not configured' };
    }

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    // Set sender
    sendSmtpEmail.sender = {
      name: process.env.BREVO_FROM_NAME || 'Ejidike Foundation',
      email: process.env.BREVO_FROM_EMAIL
    };

    // Set recipient
    sendSmtpEmail.to = [
      {
        email: to,
        name: toName || to
      }
    ];

    // Set reply-to if provided
    if (replyTo) {
      sendSmtpEmail.replyTo = {
        email: replyTo
      };
    }

    // Set subject and content
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    // Set text content (fallback for email clients that don't support HTML)
    if (text) {
      sendSmtpEmail.textContent = text;
    }

    // Send the email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    return {
      success: true,
      messageId: response.body?.messageId
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

/**
 * Send bulk emails (for notifications to multiple users)
 */
export async function sendBulkEmails(
  emails: SendEmailParams[]
): Promise<{ success: boolean; sent: number; failed: number; errors: any[] }> {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  );

  const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - sent;
  const errors = results
    .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
    .map(r => r.status === 'rejected' ? r.reason : (r as any).value.error);

  return {
    success: sent > 0,
    sent,
    failed,
    errors
  };
}

/**
 * Validate email configuration
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.BREVO_API_KEY && process.env.BREVO_FROM_EMAIL);
}
