/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/mentors/apply/route.ts
 * PURPOSE: Handle mentor application submissions (using mentor_applications table)
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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { motivation, experience_description, areas_of_support } = body;

    if (!motivation || !experience_description || !areas_of_support) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if already applied
    const { data: existing } = await supabase
      .from('mentor_applications')
      .select('*')
      .eq('profile_id', profile.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Mentor application already exists' },
        { status: 400 }
      );
    }

    // Create mentor application
    const { data, error } = await supabase
      .from('mentor_applications')
      .insert({
        profile_id: profile.id,
        motivation,
        experience_description,
        areas_of_support,
        status: 'pending'
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

// GET - Fetch mentor applications (admin only)
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let query = supabase
      .from('mentor_applications')
      .select(`
        *,
        profile:profiles!mentor_applications_profile_id_fkey (
          full_name,
          email,
          phone
        )
      `);

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('submitted_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('GET mentor applications error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}