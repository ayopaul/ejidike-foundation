/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/auth/register/route.ts
 * PURPOSE: User registration/signup - handles profile creation with email verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email';
import { emailVerificationEmail } from '@/lib/email-templates';

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Generate a secure verification token
function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

// Get expiration time (24 hours from now)
function getExpirationTime(): Date {
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);
  return expires;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, role, captchaToken } = body;

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate captcha token
    if (!captchaToken) {
      return NextResponse.json(
        { error: 'Captcha verification required' },
        { status: 400 }
      );
    }

    // Verify captcha token with Cloudflare Turnstile
    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: captchaToken,
        }),
      }
    );

    const turnstileData = await turnstileResponse.json();

    if (!turnstileData.success) {
      console.error('Turnstile verification failed:', turnstileData);
      return NextResponse.json(
        { error: 'Captcha verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['applicant', 'mentor', 'partner'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be applicant, mentor, or partner' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = getExpirationTime();

    // Create auth user with admin client
    // email_confirm: false means user needs to verify email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email verification
      user_metadata: {
        full_name,
        role
      }
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create or update profile using admin client (bypasses RLS)
    // Store verification token in profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: authData.user.id,
        email,
        full_name,
        role,
        email_verified: false,
        email_verification_token: verificationToken,
        email_verification_expires: verificationExpires.toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        {
          error: 'Failed to create user profile',
          details: profileError.message,
          code: profileError.code,
          hint: profileError.hint
        },
        { status: 500 }
      );
    }

    // Send verification email
    const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`;
    const emailContent = emailVerificationEmail({
      userName: full_name,
      verificationUrl,
      expiresIn: '24 hours'
    });

    const emailResult = await sendEmail({
      to: email,
      toName: full_name,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail registration if email fails, user can request resend
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      emailSent: emailResult.success,
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
