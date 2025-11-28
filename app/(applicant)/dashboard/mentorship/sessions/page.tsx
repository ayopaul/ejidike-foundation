// appl/(applicant)/dashboard/mentorship/sessions/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface Session {
  id: string;
  session_date: string;
  duration_minutes: number;
  mode: string;
  status: string;
  notes: string | null;
  topics_covered: string[] | null;
  action_items: string[] | null;
  next_session_goals: string | null;
  created_at: string;
}

export default function MentorshipSessionsPage() {
  const { user, profile } = useUserProfile();
  const supabase = createSupabaseClient();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mentorshipMatch, setMentorshipMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchSessionsData();
    }
  }, [user]);

  const fetchSessionsData = async () => {
    try {
      setLoading(true);

      // Get active mentorship match
      const { data: match } = await supabase
        .from('mentorship_matches')
        .select(`
          id,
          mentor_id,
          profiles!mentorship_matches_mentor_id_fkey (
            full_name,
            email
          )
        `)
        .eq('mentee_id', profile?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!match) {
        setLoading(false);
        return;
      }

      setMentorshipMatch(match);

      // Fetch all sessions for this match
      const { data: sessionsData, error } = await supabase
        .from('mentorship_sessions')
        .select('*')
        .eq('match_id', match.id)
        .order('session_date', { ascending: false });

      if (error) throw error;

      setSessions(sessionsData || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'no_show':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in_person':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'scheduled':
        return 'secondary';
      case 'no_show':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filterSessions = (status: string) => {
    if (status === 'all') return sessions;
    if (status === 'upcoming') {
      return sessions.filter(s => 
        s.status === 'scheduled' && new Date(s.session_date) > new Date()
      );
    }
    if (status === 'completed') {
      return sessions.filter(s => s.status === 'completed');
    }
    return sessions;
  };

  const filteredSessions = filterSessions(activeTab);

  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const upcomingCount = sessions.filter(s => 
    s.status === 'scheduled' && new Date(s.session_date) > new Date()
  ).length;
  const totalHours = sessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.duration_minutes, 0) / 60;

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['applicant']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // No active mentorship
  if (!mentorshipMatch) {
    return (
      <ProtectedRoute allowedRoles={['applicant']}>
        <DashboardLayout>
          <div className="space-y-6">
            <div>
              <Button asChild variant="ghost" className="mb-4">
                <Link href="/dashboard/mentorship">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Mentorship
                </Link>
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">Mentorship Sessions</h2>
            </div>

            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Active Mentorship</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  You need an active mentor to view sessions. Request a mentor to get started.
                </p>
                <Button asChild>
                  <Link href="/dashboard/mentorship/request">
                    Find a Mentor
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['applicant']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/dashboard/mentorship">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mentorship
              </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Mentorship Sessions</h2>
            <p className="text-muted-foreground">
              Your session history with {mentorshipMatch.profiles?.full_name}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {completedCount} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  Hours of mentorship
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingCount}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled sessions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sessions Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All Sessions ({sessions.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingCount})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredSessions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">
                      {activeTab === 'upcoming' 
                        ? 'No upcoming sessions scheduled'
                        : activeTab === 'completed'
                        ? 'No completed sessions yet'
                        : 'No sessions recorded yet'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your mentor will schedule sessions with you
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredSessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {getStatusIcon(session.status)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">
                                    {formatDate(session.session_date)}
                                  </h3>
                                  <Badge variant={getStatusColor(session.status) as any}>
                                    {session.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {session.duration_minutes} minutes
                                  </span>
                                  <span className="flex items-center gap-1">
                                    {getModeIcon(session.mode)}
                                    {session.mode.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Session Notes */}
                            {session.notes && (
                              <div className="bg-muted/50 rounded-lg p-4">
                                <div className="flex items-start gap-2 mb-2">
                                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <p className="font-medium text-sm">Session Notes</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {session.notes}
                                </p>
                              </div>
                            )}

                            {/* Topics Covered */}
                            {session.topics_covered && session.topics_covered.length > 0 && (
                              <div>
                                <p className="font-medium text-sm mb-2">Topics Covered:</p>
                                <div className="flex flex-wrap gap-2">
                                  {session.topics_covered.map((topic, index) => (
                                    <Badge key={index} variant="outline">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Action Items */}
                            {session.action_items && session.action_items.length > 0 && (
                              <div>
                                <p className="font-medium text-sm mb-2">Action Items:</p>
                                <ul className="space-y-1">
                                  {session.action_items.map((item, index) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-primary mt-1">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Next Session Goals */}
                            {session.next_session_goals && (
                              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                <p className="font-medium text-sm mb-1 text-blue-900 dark:text-blue-100">
                                  Next Session Goals:
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  {session.next_session_goals}
                                </p>
                              </div>
                            )}

                            {/* Timestamp */}
                            <p className="text-xs text-muted-foreground">
                              Logged on {formatDate(session.created_at)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Contact Mentor Card */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Need to Schedule a Session?</CardTitle>
              <CardDescription>
                Contact your mentor to schedule your next mentorship session
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button asChild>
                <a href={`mailto:${mentorshipMatch.profiles?.email}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Mentor
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/mentorship">
                  View Mentorship Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}