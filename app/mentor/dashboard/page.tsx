'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { MentorProfile, MentorshipMatch, MentorshipSession } from '@/types/database';

export default function MentorDashboard() {
  const { user } = useUserProfile();
  const supabase = createSupabaseClient();
  
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [activeMentees, setActiveMentees] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMentees: 0,
    activeMentees: 0,
    totalSessions: 0,
    totalHours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMentorData();
    }
  }, [user]);

  const fetchMentorData = async () => {
    try {
      setLoading(true);

      // Fetch mentor profile
      const { data: profile } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setMentorProfile(profile);

      // Fetch active mentees
      const { data: matches } = await supabase
        .from('mentorship_matches')
        .select(`
          *,
          mentee:profiles!mentorship_matches_mentee_id_fkey(*)
        `)
        .eq('mentor_id', user?.id)
        .eq('status', 'active');

      setActiveMentees(matches || []);

      // Fetch upcoming sessions
      const today = new Date().toISOString();
      const { data: sessions } = await supabase
        .from('mentorship_sessions')
        .select(`
          *,
          match:mentorship_matches(
            id,
            mentee_id,
            profiles!mentorship_matches_mentee_id_fkey(
              id,
              full_name,
              email
            )
          )
        `)
        .gte('session_date', today)
        .order('session_date', { ascending: true })
        .limit(5);

      setUpcomingSessions(sessions || []);

      // Calculate stats
      const { data: allMatches } = await supabase
        .from('mentorship_matches')
        .select('*')
        .eq('mentor_id', user?.id);

      const matchIds = allMatches?.map(m => m.id) || [];

      const { data: allSessions } = await supabase
        .from('mentorship_sessions')
        .select('duration_minutes')
        .in('match_id', matchIds);

        const totalHours = (allSessions ?? []).reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / 60;

      setStats({
        totalMentees: allMatches?.length || 0,
        activeMentees: matches?.length || 0,
        totalSessions: allSessions?.length || 0,
        totalHours: Math.round(totalHours),
      });

    } catch (error) {
      console.error('Error fetching mentor data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here's an overview of your mentorship activities
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Mentees
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeMentees}</div>
                <p className="text-xs text-muted-foreground">
                  of {stats.totalMentees} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sessions
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Hours
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalHours}</div>
                <p className="text-xs text-muted-foreground">
                  Mentorship time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Availability
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge 
                  variant={mentorProfile?.availability_status === 'available' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {mentorProfile?.availability_status || 'Not Set'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {mentorProfile?.max_mentees || 0} max mentees
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="mentees" className="space-y-4">
            <TabsList>
              <TabsTrigger value="mentees">Active Mentees</TabsTrigger>
              <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
            </TabsList>

            <TabsContent value="mentees" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Mentees</CardTitle>
                    <Button asChild size="sm">
                      <Link href="/mentor/mentees">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeMentees.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active mentees yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeMentees.slice(0, 5).map((match) => (
                        <div
                          key={match.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{match.mentee?.full_name || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">
                                Started {new Date(match.start_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/mentor/mentees/${match.id}`}>
                              View Details
                            </Link>
                          </Button>
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
                    <CardTitle>Upcoming Sessions</CardTitle>
                    <Button asChild size="sm">
                      <Link href="/mentor/sessions/log">
                        <Plus className="mr-2 h-4 w-4" />
                        Log Session
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {upcomingSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming sessions scheduled</p>
                      <Button asChild className="mt-4" size="sm">
                        <Link href="/mentor/sessions/log">
                          Schedule a Session
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => {
                        const menteeName = (session.match as any)?.profiles?.full_name || 'Unknown';
                        
                        return (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{menteeName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(session.session_date).toLocaleString()} • {session.duration_minutes} min • {session.mode}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">{session.mode}</Badge>
                          </div>
                        );
                      })}
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
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/mentor/sessions/log" className="flex flex-col items-center gap-2">
                  <Plus className="h-6 w-6" />
                  <span>Log New Session</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/mentor/profile" className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Update Profile</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/mentor/resources" className="flex flex-col items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>View Resources</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}