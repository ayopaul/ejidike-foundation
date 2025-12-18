import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check for active mentorship match
    const { data: match, error: matchError } = await supabase
      .from('mentorship_matches')
      .select(`
        id,
        status,
        goals,
        created_at,
        mentor_id
      `)
      .eq('mentee_id', profile.id)
      .in('status', ['active', 'pending'])
      .maybeSingle();

    if (matchError) {
      console.error('Error fetching mentorship:', matchError);
      return NextResponse.json(
        { error: 'Failed to fetch mentorship status' },
        { status: 500 }
      );
    }

    if (!match) {
      return NextResponse.json({
        hasMentor: false,
        status: null,
      });
    }

    // Fetch mentor details
    const { data: mentorProfile, error: mentorError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', match.mentor_id)
      .single();

    if (mentorError) {
      console.error('Error fetching mentor profile:', mentorError);
    }

    return NextResponse.json({
      hasMentor: true,
      status: match.status,
      mentorName: mentorProfile?.full_name || 'Unknown',
      mentorEmail: mentorProfile?.email,
      matchId: match.id,
      goals: match.goals,
      createdAt: match.created_at,
    });
  } catch (error: any) {
    console.error('Error in mentorship status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}