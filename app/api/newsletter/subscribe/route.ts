import { NextRequest, NextResponse } from 'next/server';

// Verify Turnstile captcha token
async function verifyCaptcha(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || '',
        response: token,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Captcha verification error:', error);
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY is not set');
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

      console.error('Brevo API error:', data);
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to subscribe' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to the newsletter!'
    });

  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
