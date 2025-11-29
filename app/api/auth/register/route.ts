/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/auth/register/route.ts
 * PURPOSE: User registration/signup - handles profile creation manually
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // You need this key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, role } = body;

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Create auth user with admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for testing
      user_metadata: {
        full_name,
        role
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      
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
    // Use upsert in case a database trigger already created the profile
    console.log('Attempting to create/update profile for user:', authData.user.id);
    console.log('Profile data:', { user_id: authData.user.id, email, full_name, role });

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: authData.user.id,
        email,
        full_name,
        role
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (profileError) {
      console.error('========== PROFILE CREATION ERROR ==========');
      console.error('Error code:', profileError.code);
      console.error('Error message:', profileError.message);
      console.error('Error details:', profileError.details);
      console.error('Error hint:', profileError.hint);
      console.error('Full error:', JSON.stringify(profileError, null, 2));
      console.error('===========================================');

      // If profile creation fails, delete the auth user
      console.log('Deleting auth user due to profile creation failure...');
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

    console.log('Profile created successfully:', profileData);

    return NextResponse.json({
      success: true,
      message: 'Registration successful. You can now login.',
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    });
  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}