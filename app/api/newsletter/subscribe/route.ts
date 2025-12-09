import { NextRequest, NextResponse } from 'next/server';

// Verify Turnstile captcha token
async function verifyCaptcha(token: string): Promise<boolean> {
  try {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error('TURNSTILE_SECRET_KEY is not set');
      return false;
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();

    return data.success === true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, captchaToken } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Verify captcha
    if (!captchaToken) {
      return NextResponse.json(
        { success: false, error: 'Captcha verification is required' },
        { status: 400 }
      );
    }

    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { success: false, error: 'Captcha verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Validate email format using a simple, ReDoS-safe check
    // First, limit input length to prevent DoS
    if (typeof email !== 'string' || email.length > 254) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Simple validation: must have exactly one @, with content before and after
    const atIndex = email.indexOf('@');
    const lastAtIndex = email.lastIndexOf('@');
    if (atIndex < 1 || atIndex !== lastAtIndex || atIndex === email.length - 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check for a dot in the domain part
    const domain = email.slice(atIndex + 1);
    if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!process.env.BREVO_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Newsletter service not configured' },
        { status: 500 }
      );
    }

    // Add contact to Brevo using the Contacts API
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        updateEnabled: true, // Update if contact already exists
        attributes: {
          NEWSLETTER_SUBSCRIBER: true,
          SUBSCRIBED_AT: new Date().toISOString(),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle duplicate contact (already subscribed)
      if (data.code === 'duplicate_parameter') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter!'
        });
      }

      return NextResponse.json(
        { success: false, error: data.message || 'Failed to subscribe' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to the newsletter!'
    });

  } catch {
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
