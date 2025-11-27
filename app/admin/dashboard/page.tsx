'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  FileText,
  Award,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DashboardStats {
  totalUsers: number;
  totalApplicants: number;
  totalMentors: number;
  totalPartners: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalPrograms: number;
  activePrograms: number;
  totalFunding: number;
  disbursedFunding: number;
}

export default function AdminDashboard() {
  const { user } = useUserProfile();
  const supabase = createSupabaseClient();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalApplicants: 0,
    totalMentors: 0,
    totalPartners: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalPrograms: 0,
    activePrograms: 0,
    totalFunding: 0,
    disbursedFunding: 0,
  });
  
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user counts
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalApplicants } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'applicant');

      const { count: totalMentors } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'mentor');

      const { count: totalPartners } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'partner');

      // Fetch application stats
      const { data: applications } = await supabase
        .from('applications')
        .select('status');

      const totalApplications = applications?.length || 0;
      const pendingApplications = applications?.filter(
        a => a.status === 'submitted' || a.status === 'under_review'
      ).length || 0;
      const approvedApplications = applications?.filter(a => a.status === 'approved').length || 0;
      const rejectedApplications = applications?.filter(a => a.status === 'rejected').length || 0;

      // Fetch program stats
      const { count: totalPrograms } = await supabase
        .from('programs')
        .select('*', { count: 'exact', head: true });

      const { count: activePrograms } = await supabase
        .from('programs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Fetch funding stats - FIXED
      const { data: programsData } = await supabase
        .from('programs')
        .select('budget');

      const totalFunding = programsData?.reduce((sum, p) => {
        return sum + (Number(p.budget) || 0);
      }, 0) || 0;
      
      // Calculate disbursed funding (approved applications) - FIXED
      const { data: approvedAppsData } = await supabase
        .from('applications')
        .select(`
          id,
          program_id,
          programs!inner(budget)
        `)
        .eq('status', 'approved');

      const disbursedFunding = approvedAppsData?.reduce((sum: number, app: any) => {
        const budget = app.programs?.budget || 0;
        return sum + Number(budget);
      }, 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalApplicants: totalApplicants || 0,
        totalMentors: totalMentors || 0,
        totalPartners: totalPartners || 0,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        totalPrograms: totalPrograms || 0,
        activePrograms: activePrograms || 0,
        totalFunding,
        disbursedFunding,
      });

      // Fetch recent applications
      const { data: recentApps } = await supabase
        .from('applications')
        .select(`
          *,
          applicant:profiles!applications_applicant_id_fkey(full_name, email),
          program:programs(title)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentApplications(recentApps || []);

      // Fetch recent users
      const { data: recentUsersList } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentUsers(recentUsersList || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
            <p className="text-muted-foreground">
              Platform overview and management
            </p>
          </div>

          {/* User Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">All registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Applicants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplicants}</div>
                  <p className="text-xs text-muted-foreground">Grant seekers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mentors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMentors}</div>
                  <p className="text-xs text-muted-foreground">Active mentors</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Partners</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPartners}</div>
                  <p className="text-xs text-muted-foreground">Organizations</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Application Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Application Statistics</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                  <p className="text-xs text-muted-foreground">Awaiting decision</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.approvedApplications}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalApplications > 0 
                      ? `${((stats.approvedApplications / stats.totalApplications) * 100).toFixed(1)}% approval rate`
                      : '0% approval rate'
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rejectedApplications}</div>
                  <p className="text-xs text-muted-foreground">Not approved</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Program & Funding Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Programs & Funding</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPrograms}</div>
                  <p className="text-xs text-muted-foreground">All programs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activePrograms}</div>
                  <p className="text-xs text-muted-foreground">Currently accepting applications</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalFunding)}</div>
                  <p className="text-xs text-muted-foreground">Total budget allocated</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disbursed</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.disbursedFunding)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalFunding > 0
                      ? `${((stats.disbursedFunding / stats.totalFunding) * 100).toFixed(1)}% distributed`
                      : '0% distributed'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <Tabs defaultValue="applications" className="space-y-4">
            <TabsList>
              <TabsTrigger value="applications">Recent Applications</TabsTrigger>
              <TabsTrigger value="users">New Users</TabsTrigger>
            </TabsList>

            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Latest Applications</CardTitle>
                    <Button asChild size="sm">
                      <Link href="/admin/applications">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentApplications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{app.applicant?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.program?.title || 'Unknown Program'} • {formatDate(app.created_at)}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/applications/${app.id}`}>Review</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recently Registered</CardTitle>
                    <Button asChild size="sm">
                      <Link href="/admin/users">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email} • {user.role} • {formatDate(user.created_at)}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/users/${user.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/admin/applications" className="flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Review Applications</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/admin/programs/new" className="flex flex-col items-center gap-2">
                  <Award className="h-6 w-6" />
                  <span>Create Program</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/admin/mentors" className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Manage Mentors</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/admin/partners" className="flex flex-col items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  <span>Manage Partners</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}