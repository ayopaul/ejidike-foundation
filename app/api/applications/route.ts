/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/applications/route.ts
 * PURPOSE: Handle application submissions and retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Fetch applications
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const programId = searchParams.get('program_id');

    let query = supabase
      .from('applications')
      .select(`
        *,
        programs (
          title,
          type,
          budget
        ),
        applicant:profiles!applicant_id (
          full_name,
          email
        )
      `);

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Filter by user if not admin
    if (profile?.role !== 'admin') {
      query = query.eq('applicant_id', user.id);
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (programId) {
      query = query.eq('program_id', programId);
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
    console.error('GET applications error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create/submit application
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
      program_id,
      application_data,
      documents = []
    } = body;

    if (!program_id || !application_data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        applicant_id: user.id,
        program_id,
        application_data,
        status: 'draft',
        submitted_at: null
      })
      .select()
      .single();

    if (appError) {
      return NextResponse.json(
        { error: appError.message },
        { status: 500 }
      );
    }

    // Insert documents if provided
    if (documents.length > 0) {
      const documentsToInsert = documents.map((doc: any) => ({
        application_id: application.id,
        document_type: doc.document_type,
        file_url: doc.file_url,
        file_name: doc.file_name
      }));

      const { error: docsError } = await supabase
        .from('application_documents')
        .insert(documentsToInsert);

      if (docsError) {
        console.error('Error inserting documents:', docsError);
      }
    }

    return NextResponse.json({
      success: true,
      data: application
    });
  } catch (error: any) {
    console.error('POST application error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update application
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

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID required' },
        { status: 400 }
      );
    }

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Build query
    let query = supabase
      .from('applications')
      .update(updates)
      .eq('id', id);

    // Non-admins can only update their own applications
    if (profile?.role !== 'admin') {
      query = query.eq('applicant_id', user.id);
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
    console.error('PATCH application error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}