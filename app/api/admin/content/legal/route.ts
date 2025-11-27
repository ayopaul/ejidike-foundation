/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/admin/content/legal/route.ts
 * PURPOSE: Manage legal documents (Privacy Policy, Terms, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Fetch legal documents
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data, error } = await supabase
      .from('legal_documents')
      .select('*')
      .single();

    if (error && error.code === 'PGRST116') {
      // No document exists yet
      return NextResponse.json({ data: null });
    }

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('GET legal documents error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST/PATCH - Update legal documents (admin only)
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
      privacy_policy,
      terms_of_service,
      cookie_policy
    } = body;

    // Upsert (update or insert) legal documents
    // We maintain only one row with id=1
    const { data, error } = await supabase
      .from('legal_documents')
      .upsert({
        id: 1,
        privacy_policy,
        terms_of_service,
        cookie_policy,
        updated_at: new Date().toISOString()
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
    console.error('POST legal documents error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}