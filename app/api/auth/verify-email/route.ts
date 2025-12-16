/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/auth/verify-email/route.ts
 * PURPOSE: Email verification and resend verification endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email';
import { resendVerificationEmail } from '@/lib/email-templates';

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

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find profile with this token
    const { data: profile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, email, full_name, email_verified, email_verification_expires')
      .eq('email_verification_token', token)
      .single();

    if (findError || !profile) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (profile.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified',
        alreadyVerified: true
      });
    }

    // Check if token has expired
    const expiresAt = new Date(profile.email_verification_expires);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Verification link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Update profile to mark as verified
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Failed to update verification status:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    // Also confirm the auth user's email in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.user_id,
      { email_confirm: true }
    );

    if (authError) {
      console.error('Failed to confirm auth email:', authError);
      // Don't fail - profile is already updated
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      email: profile.email
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/verify-email
 * Resend verification email
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find profile by email
    const { data: profile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, full_name, email_verified')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (findError || !profile) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.'
      });
    }

    // Check if already verified
    if (profile.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified. You can login.',
        alreadyVerified: true
      });
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    const verificationExpires = getExpirationTime();

    // Update profile with new token
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        email_verification_token: verificationToken,
        email_verification_expires: verificationExpires.toISOString()
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Failed to update verification token:', updateError);
      return NextResponse.json(
        { error: 'Failed to generate verification link' },
        { status: 500 }
      );
    }

    // Send new verification email
    const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`;
    const emailContent = resendVerificationEmail({
      userName: profile.full_name,
      verificationUrl,
      expiresIn: '24 hours'
    });

    const emailResult = await sendEmail({
      to: email,
      toName: profile.full_name,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resend verification' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/verify-email?token=xxx
 * Check verification token status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find profile with this token
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('email, email_verified, email_verification_expires')
      .eq('email_verification_token', token)
      .single();

    if (error || !profile) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid token'
      });
    }

    if (profile.email_verified) {
      return NextResponse.json({
        valid: true,
        verified: true,
        email: profile.email
      });
    }

    const expiresAt = new Date(profile.email_verification_expires);
    const isExpired = expiresAt < new Date();

    return NextResponse.json({
      valid: !isExpired,
      verified: false,
      expired: isExpired,
      email: profile.email
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check token' },
      { status: 500 }
    );
  }
}
