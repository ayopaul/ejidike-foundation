import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mentor_id, mentee_id, goals } = body;

    // Validate required fields
    if (!mentor_id || !mentee_id) {
      return NextResponse.json(
        { error: 'Mentor ID and Mentee ID are required' },
        { status: 400 }
      );
    }

    // Check if mentor exists and is available
    const { data: mentorProfile, error: mentorError } = await supabase
      .from('profiles')
      .select(`
        id,
        role,
        mentor_profiles (
          is_available
        )
      `)
      .eq('id', mentor_id)
      .single();

    if (mentorError || !mentorProfile) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    if (mentorProfile.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Selected user is not a mentor' },
        { status: 400 }
      );
    }

    if (!mentorProfile.mentor_profiles?.[0]?.is_available) {
      return NextResponse.json(
        { error: 'This mentor is not currently accepting new mentees' },
        { status: 400 }
      );
    }

    // Check if user already has an active or pending mentorship
    const { data: existingMatch } = await supabase
      .from('mentorship_matches')
      .select('id, status')
      .eq('mentee_id', mentee_id)
      .in('status', ['active', 'pending'])
      .maybeSingle();

    if (existingMatch) {
      return NextResponse.json(
        { 
          error: existingMatch.status === 'active' 
            ? 'You already have an active mentor'
            : 'You have a pending mentorship request. Please wait for a response.'
        },
        { status: 400 }
      );
    }

    // Create mentorship match with pending status
    const { data: match, error: matchError } = await supabase
      .from('mentorship_matches')
      .insert({
        mentor_id,
        mentee_id,
        status: 'pending',
        goals: goals || null,
      })
      .select()
      .single();

    if (matchError) {
      console.error('Error creating match:', matchError);
      return NextResponse.json(
        { error: 'Failed to create mentorship request' },
        { status: 500 }
      );
    }

    // TODO: Send notification to mentor via email or in-app notification
    // You can add this functionality later

    return NextResponse.json({
      success: true,
      match,
      message: 'Mentorship request sent successfully!',
    });
  } catch (error: any) {
    console.error('Error in mentorship request:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}