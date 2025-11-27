/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/partners/organization/route.ts
 * PURPOSE: Manage partner organization profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Fetch partner organizations
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
    const status = searchParams.get('verification_status');

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    let query = supabase
      .from('partner_organizations')
      .select(`
        *,
        profile:profiles!user_id (
          full_name,
          email,
          phone
        )
      `);

    // Non-admins can only see their own organization
    if (profile?.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    // Apply filters
    if (status) {
      query = query.eq('verification_status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('GET organizations error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create partner organization
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

    // Check if organization already exists for this user
    const { data: existing } = await supabase
      .from('partner_organizations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Organization already exists for this user' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      organization_name,
      description,
      website,
      logo_url
    } = body;

    if (!organization_name) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('partner_organizations')
      .insert({
        user_id: user.id,
        organization_name,
        description,
        website,
        logo_url,
        verification_status: 'pending'
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
    console.error('POST organization error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update partner organization
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
    const { id, ...updates } = body;

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    let query = supabase
      .from('partner_organizations')
      .update(updates)
      .eq('id', id || user.id); // Use id if provided, otherwise user.id

    // Non-admins can only update their own organization
    if (profile?.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.select().single();

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
    console.error('PATCH organization error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}