/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/opportunities/route.ts
 * PURPOSE: Manage partner opportunities
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Fetch opportunities
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const partnerId = searchParams.get('partner_id');

    let query = supabase
      .from('partner_opportunities')
      .select(`
        *,
        partner:partner_organizations!partner_opportunities_partner_id_fkey (
          organization_name
        )
      `);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (partnerId) {
      query = query.eq('partner_id', partnerId);
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
    console.error('GET opportunities error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create opportunity (partner only)
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
      .select('role, id')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'partner') {
      return NextResponse.json(
        { error: 'Forbidden: Partner access required' },
        { status: 403 }
      );
    }

    // Get partner organization
    const { data: organization } = await supabase
      .from('partner_organizations')
      .select('id')
      .eq('user_id', profile.id)
      .single();

    if (!organization) {
      return NextResponse.json(
        { error: 'Partner organization not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('partner_opportunities')
      .insert({
        ...body,
        partner_id: organization.id
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
    console.error('POST opportunity error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update opportunity
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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Get partner organization
    const { data: organization } = await supabase
      .from('partner_organizations')
      .select('id')
      .eq('user_id', profile?.id)
      .single();

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Opportunity ID required' },
        { status: 400 }
      );
    }

    // Partners can only update their own opportunities
    const { data, error } = await supabase
      .from('partner_opportunities')
      .update(updates)
      .eq('id', id)
      .eq('partner_id', organization?.id)
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
    console.error('PATCH opportunity error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete opportunity
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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Get partner organization
    const { data: organization } = await supabase
      .from('partner_organizations')
      .select('id')
      .eq('user_id', profile?.id)
      .single();

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Opportunity ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('partner_opportunities')
      .delete()
      .eq('id', id)
      .eq('partner_id', organization?.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE opportunity error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}