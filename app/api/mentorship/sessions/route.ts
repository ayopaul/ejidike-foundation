/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/mentorship/sessions/route.ts
 * PURPOSE: Log and manage mentorship sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST - Create a session
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
    const {
      match_id,
      session_date,
      duration,
      mode,
      notes,
      status = 'completed'
    } = body;

    if (!match_id || !session_date || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify match exists and user is the mentor
    const { data: match, error: matchError } = await supabase
      .from('mentorship_matches')
      .select('*')
      .eq('id', match_id)
      .eq('mentor_id', user.id)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Match not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create session
    const { data, error } = await supabase
      .from('mentorship_sessions')
      .insert({
        match_id,
        session_date,
        duration,
        mode,
        notes,
        status
      })
      .select(`
        *,
        match:mentorship_matches (
          mentor:profiles!mentor_id (
            full_name
          ),
          mentee:profiles!mentee_id (
            full_name
          )
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
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch sessions
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
    const matchId = searchParams.get('match_id');

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    let query = supabase
      .from('mentorship_sessions')
      .select(`
        *,
        match:mentorship_matches (
          mentor:profiles!mentor_id (
            full_name,
            email
          ),
          mentee:profiles!mentee_id (
            full_name,
            email
          )
        )
      `);

    // Filter by match if provided
    if (matchId) {
      query = query.eq('match_id', matchId);
    }

    // Filter by role
    if (profile?.role === 'mentor') {
      query = query.eq('match.mentor_id', user.id);
    } else if (profile?.role === 'applicant') {
      query = query.eq('match.mentee_id', user.id);
    }
    // Admins see all sessions

    query = query.order('session_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('GET sessions error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}