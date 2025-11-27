/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/mentors/apply/route.ts
 * PURPOSE: Handle mentor application submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { expertise, bio } = body;

    if (!expertise || !bio) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if already applied
    const { data: existing } = await supabase
      .from('mentor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Mentor application already exists' },
        { status: 400 }
      );
    }

    // Create mentor profile
    const { data, error } = await supabase
      .from('mentor_profiles')
      .insert({
        user_id: user.id,
        expertise,
        bio,
        status: 'pending',
        availability_status: 'unavailable'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Mentor apply error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}