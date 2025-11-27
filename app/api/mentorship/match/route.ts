/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/mentorship/match/route.ts
 * PURPOSE: Create mentorship matches
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST - Create a mentorship match
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { mentor_id, mentee_id } = body;

    if (!mentor_id || !mentee_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if mentor profile exists and is active
    const { data: mentorProfile, error: mentorError } = await supabase
      .from('mentor_profiles')
      .select('*')
      .eq('user_id', mentor_id)
      .eq('status', 'approved')
      .single();

    if (mentorError || !mentorProfile) {
      return NextResponse.json(
        { error: 'Mentor not found or not approved' },
        { status: 400 }
      );
    }

    // Check if mentee exists
    const { data: menteeProfile, error: menteeError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', mentee_id)
      .single();

    if (menteeError || !menteeProfile) {
      return NextResponse.json(
        { error: 'Mentee not found' },
        { status: 400 }
      );
    }

    // Check if match already exists
    const { data: existingMatch } = await supabase
      .from('mentorship_matches')
      .select('*')
      .eq('mentor_id', mentor_id)
      .eq('mentee_id', mentee_id)
      .eq('status', 'active')
      .single();

    if (existingMatch) {
      return NextResponse.json(
        { error: 'Active match already exists' },
        { status: 400 }
      );
    }

    // Create match
    const { data, error } = await supabase
      .from('mentorship_matches')
      .insert({
        mentor_id,
        mentee_id,
        status: 'active',
        matched_at: new Date().toISOString()
      })
      .select(`
        *,
        mentor:profiles!mentor_id (
          full_name,
          email,
          avatar_url
        ),
        mentee:profiles!mentee_id (
          full_name,
          email,
          avatar_url
        )
      `)
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
    console.error('Create match error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch mentorship matches
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    let query = supabase
      .from('mentorship_matches')
      .select(`
        *,
        mentor:profiles!mentor_id (
          full_name,
          email,
          avatar_url
        ),
        mentee:profiles!mentee_id (
          full_name,
          email,
          avatar_url
        )
      `);

    // Filter by role
    if (profile?.role === 'mentor') {
      query = query.eq('mentor_id', user.id);
    } else if (profile?.role === 'applicant') {
      query = query.eq('mentee_id', user.id);
    }
    // Admins see all matches

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('matched_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('GET matches error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}