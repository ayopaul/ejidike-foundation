/**
 * FILE PATH: /ejdk/ejidike-foundation/app/api/admin/stats/route.ts
 * PURPOSE: Fetch dashboard statistics for admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

    // Fetch various statistics in parallel
    const [
      applicationsResult,
      programsResult,
      usersResult,
      mentorsResult,
      partnersResult,
      recentApplicationsResult
    ] = await Promise.all([
      // Total applications by status
      supabase
        .from('applications')
        .select('status', { count: 'exact', head: true }),
      
      // Active programs
      supabase
        .from('programs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      
      // Total users by role
      supabase
        .from('profiles')
        .select('role', { count: 'exact', head: true }),
      
      // Total mentors
      supabase
        .from('mentor_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
      
      // Total verified partners
      supabase
        .from('partner_organizations')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified'),
      
      // Recent applications
      supabase
        .from('applications')
        .select(`
          *,
          programs (title),
          applicant:profiles!applicant_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    // Count applications by status
    const applicationsByStatus = await supabase
      .from('applications')
      .select('status');

    const statusCounts = applicationsByStatus.data?.reduce((acc: any, app: any) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    // Count users by role
    const usersByRole = await supabase
      .from('profiles')
      .select('role');

    const roleCounts = usersByRole.data?.reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      applications: {
        total: applicationsResult.count || 0,
        byStatus: statusCounts || {}
      },
      programs: {
        active: programsResult.count || 0
      },
      users: {
        total: usersResult.count || 0,
        byRole: roleCounts || {}
      },
      mentors: {
        approved: mentorsResult.count || 0
      },
      partners: {
        verified: partnersResult.count || 0
      },
      recentApplications: recentApplicationsResult.data || []
    };

    return NextResponse.json({ data: stats });
  } catch (error: any) {
    console.error('GET stats error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}