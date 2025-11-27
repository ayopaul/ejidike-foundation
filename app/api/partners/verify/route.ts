/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/partners/verify/route.ts
 * PURPOSE: Admin verification of partner organizations
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
    const {
      organization_id,
      verification_status, // 'verified' or 'rejected'
      verification_notes
    } = body;

    if (!organization_id || !verification_status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['verified', 'rejected'].includes(verification_status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "verified" or "rejected"' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('partner_organizations')
      .update({
        verification_status,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        verification_notes
      })
      .eq('id', organization_id)
      .select(`
        *,
        profile:profiles!user_id (
          full_name,
          email
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
    console.error('Verify partner error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}