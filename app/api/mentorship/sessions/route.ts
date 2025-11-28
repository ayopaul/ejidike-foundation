/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/mentorship/sessions/route.ts
 * PURPOSE: Log and manage mentorship sessions with enhanced features
 * UPDATED: Added support for topics_covered, action_items, next_session_goals
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
      duration_minutes, // Support both field names
      mode,
      notes,
      topics_covered, // NEW: Array of topics discussed
      action_items, // NEW: Array of action items for mentee
      next_session_goals, // NEW: Goals for next session
      status = 'completed'
    } = body;

    // Use duration_minutes if provided, otherwise fall back to duration
    const sessionDuration = duration_minutes || duration;

    if (!match_id || !session_date || !sessionDuration) {
      return NextResponse.json(
        { error: 'Missing required fields: match_id, session_date, duration' },
        { status: 400 }
      );
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Verify match exists and user is the mentor (or admin)
    const { data: match, error: matchError } = await supabase
      .from('mentorship_matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Check authorization: must be the mentor or admin
    if (match.mentor_id !== profile.id && profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only log sessions for your own mentees' },
        { status: 403 }
      );
    }

    // Create session with enhanced fields
    const { data, error } = await supabase
      .from('mentorship_sessions')
      .insert({
        match_id,
        session_date,
        duration_minutes: sessionDuration,
        mode,
        notes: notes || null,
        topics_covered: topics_covered || null,
        action_items: action_items || null,
        next_session_goals: next_session_goals || null,
        status
      })
      .select(`
        *,
        match:mentorship_matches (
          mentor:profiles!mentorship_matches_mentor_id_fkey (
            full_name,
            email
          ),
          mentee:profiles!mentorship_matches_mentee_id_fkey (
            full_name,
            email
          )
        )
      `)
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Session logged successfully'
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
    const status = searchParams.get('status'); // Filter by status
    const includeStats = searchParams.get('include_stats') === 'true'; // Include statistics

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Build base query
    let query = supabase
      .from('mentorship_sessions')
      .select(`
        *,
        match:mentorship_matches (
          id,
          status,
          mentor:profiles!mentorship_matches_mentor_id_fkey (
            id,
            full_name,
            email
          ),
          mentee:profiles!mentorship_matches_mentee_id_fkey (
            id,
            full_name,
            email
          )
        )
      `);

    // Filter by match if provided
    if (matchId) {
      query = query.eq('match_id', matchId);
    } else {
      // If no match_id provided, filter by user role
      if (profile.role === 'mentor') {
        // Get all matches where user is mentor
        const { data: mentorMatches } = await supabase
          .from('mentorship_matches')
          .select('id')
          .eq('mentor_id', profile.id);
        
        if (mentorMatches && mentorMatches.length > 0) {
          const matchIds = mentorMatches.map(m => m.id);
          query = query.in('match_id', matchIds);
        } else {
          // No matches found
          return NextResponse.json({ data: [], stats: null });
        }
      } else if (profile.role === 'applicant') {
        // Get all matches where user is mentee
        const { data: menteeMatches } = await supabase
          .from('mentorship_matches')
          .select('id')
          .eq('mentee_id', profile.id);
        
        if (menteeMatches && menteeMatches.length > 0) {
          const matchIds = menteeMatches.map(m => m.id);
          query = query.in('match_id', matchIds);
        } else {
          // No matches found
          return NextResponse.json({ data: [], stats: null });
        }
      }
      // Admins see all sessions (no filter)
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Order by date
    query = query.order('session_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Calculate statistics if requested
    let stats = null;
    if (includeStats && data) {
      stats = {
        total: data.length,
        completed: data.filter(s => s.status === 'completed').length,
        scheduled: data.filter(s => s.status === 'scheduled').length,
        cancelled: data.filter(s => s.status === 'cancelled').length,
        no_show: data.filter(s => s.status === 'no_show').length,
        totalHours: data
          .filter(s => s.status === 'completed')
          .reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60,
        averageDuration: data.length > 0 
          ? data.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / data.length 
          : 0,
      };
    }

    return NextResponse.json({ 
      data,
      stats,
      count: data?.length || 0
    });
  } catch (error: any) {
    console.error('GET sessions error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update a session
export async function PATCH(request: NextRequest) {
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
      session_id,
      session_date,
      duration_minutes,
      mode,
      notes,
      topics_covered,
      action_items,
      next_session_goals,
      status
    } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get session and verify ownership
    const { data: session } = await supabase
      .from('mentorship_sessions')
      .select(`
        *,
        match:mentorship_matches (
          mentor_id
        )
      `)
      .eq('id', session_id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (session.match.mentor_id !== profile.id && profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only update your own sessions' },
        { status: 403 }
      );
    }

    // Build update object (only include provided fields)
    const updates: any = {};
    if (session_date !== undefined) updates.session_date = session_date;
    if (duration_minutes !== undefined) updates.duration_minutes = duration_minutes;
    if (mode !== undefined) updates.mode = mode;
    if (notes !== undefined) updates.notes = notes;
    if (topics_covered !== undefined) updates.topics_covered = topics_covered;
    if (action_items !== undefined) updates.action_items = action_items;
    if (next_session_goals !== undefined) updates.next_session_goals = next_session_goals;
    if (status !== undefined) updates.status = status;

    // Update session
    const { data, error } = await supabase
      .from('mentorship_sessions')
      .update(updates)
      .eq('id', session_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Session updated successfully'
    });
  } catch (error: any) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a session
export async function DELETE(request: NextRequest) {
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
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get session and verify ownership
    const { data: session } = await supabase
      .from('mentorship_sessions')
      .select(`
        *,
        match:mentorship_matches (
          mentor_id
        )
      `)
      .eq('id', sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (session.match.mentor_id !== profile.id && profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only delete your own sessions' },
        { status: 403 }
      );
    }

    // Delete session
    const { error } = await supabase
      .from('mentorship_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting session:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}