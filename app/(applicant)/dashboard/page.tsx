'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Award,
  Users,
  Briefcase,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, getStatusColor } from '@/lib/utils';

export default function ApplicantDashboard() {
  const { user, profile } = useUserProfile();
  const supabase = createSupabaseClient();
  
  const [applications, setApplications] = useState<any[]>([]);
  const [openPrograms, setOpenPrograms] = useState<any[]>([]);
  const [mentorshipStatus, setMentorshipStatus] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's applications
      const { data: apps } = await supabase
        .from('applications')
        .select(`
          *,
          program:programs(*)
        `)
        .eq('applicant_id', profile?.id)
        .order('created_at', { ascending: false });

      setApplications(apps || []);

      // Calculate stats
      const stats = {
        totalApplications: apps?.length || 0,
        pendingApplications: apps?.filter(a => a.status === 'submitted' || a.status === 'under_review').length || 0,
        approvedApplications: apps?.filter(a => a.status === 'approved').length || 0,
        rejectedApplications: apps?.filter(a => a.status === 'rejected').length || 0,
      };
      setStats(stats);

      // Fetch open programs
      const { data: programs } = await supabase
        .from('programs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      setOpenPrograms(programs || []);

      // Check mentorship status
      const { data: mentorship, error: mentorshipError } = await supabase
        .from('mentorship_matches')
        .select('*')
        .eq('mentee_id', profile?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (mentorshipError) {
        console.error('Error fetching mentorship:', mentorshipError);
      }

      // If match exists, fetch mentor profile and sessions
      if (mentorship) {
        const { data: mentorProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', mentorship.mentor_id)
          .single();

        setMentorshipStatus({ ...mentorship, mentor: mentorProfile });

        // Fetch sessions for this mentorship
        const { data: sessionsData } = await supabase
          .from('mentorship_sessions')
          .select('*')
          .eq('match_id', mentorship.id)
          .order('session_date', { ascending: false });

        setSessions(sessionsData || []);
      } else {
        setMentorshipStatus(null);
        setSessions([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'under_review':
      case 'submitted':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['applicant']}>
   
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, {profile?.full_name?.split(' ')[0]}!
            </h2>
            <p className="text-muted-foreground">
              Track your applications and explore new opportunities
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/applications">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Applications
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  <p className="text-xs text-muted-foreground">
                    All time submissions
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/applications">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Review
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting decision
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/applications">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Approved
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.approvedApplications}</div>
                  <p className="text-xs text-muted-foreground">
                    Successful applications
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/mentorship">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Mentorship
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mentorshipStatus ? '1' : '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mentorshipStatus ? 'Active mentor' : 'No mentor yet'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Mentorship Status Banner */}
          {mentorshipStatus && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Your Mentor</CardTitle>
                      <CardDescription>
                        You're matched with {mentorshipStatus.mentor?.full_name}
                      </CardDescription>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href="/mentorship">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="applications" className="space-y-4">
            <TabsList>
              <TabsTrigger value="applications">My Applications</TabsTrigger>
              <TabsTrigger value="programs">Open Programs</TabsTrigger>
              {mentorshipStatus && <TabsTrigger value="sessions">Mentorship Sessions</TabsTrigger>}
            </TabsList>

            <TabsContent value="applications" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Applications</CardTitle>
                    <Button asChild size="sm">
                      <Link href="/applications">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {applications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No applications yet</p>
                      <Button asChild className="mt-4" size="sm">
                        <Link href="/browse-programs">
                          Browse Programs
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.slice(0, 5).map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            {getStatusIcon(app.status)}
                            <div>
                              <p className="font-medium">{app.program?.title}</p>
                              <p className="text-sm text-muted-foreground">
                                Submitted {formatDate(app.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={getStatusColor(app.status) as any}>
                              {app.status.replace('_', ' ')}
                            </Badge>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/applications/${app.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="programs" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Available Programs</CardTitle>
                    <Button asChild size="sm">
                      <Link href="/browse-programs">
                        View All Programs
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {openPrograms.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No open programs at the moment</p>
                      <p className="text-sm mt-2">Check back soon for new opportunities</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {openPrograms.map((program) => (
                        <div
                          key={program.id}
                          className="p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">{program.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {program.description?.substring(0, 150)}...
                              </p>
                            </div>
                            <Badge>{program.type}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              Deadline: {formatDate(program.end_date)}
                            </p>
                            <Button asChild size="sm">
                              <Link href={`/apply/${program.id}`}>
                                Apply Now
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Mentorship Sessions</CardTitle>
                      <CardDescription>
                        Sessions with {mentorshipStatus?.mentor?.full_name}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {Math.round((sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0)) / 60)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Hours</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No sessions logged yet</p>
                      <p className="text-sm mt-2">Your mentor will log sessions after each meeting</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">
                                    {new Date(session.session_date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {new Date(session.session_date).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })} • {session.duration_minutes} min
                                    </span>
                                  </div>
                                  <Badge variant="outline">{session.mode}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          {session.notes && (
                            <div className="ml-13 p-3 bg-muted/50 rounded-md">
                              <p className="text-sm font-medium mb-1">Session Notes:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {session.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                <Link href="/browse-programs" className="flex flex-col items-center gap-2">
                  <Award className="h-6 w-6" />
                  <span>Browse Programs</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/mentorship" className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Find a Mentor</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/opportunities" className="flex flex-col items-center gap-2">
                  <Briefcase className="h-6 w-6" />
                  <span>View Opportunities</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/profile" className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Update Profile</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

    </ProtectedRoute>
  );
}