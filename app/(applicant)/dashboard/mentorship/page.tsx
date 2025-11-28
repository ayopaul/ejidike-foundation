// app/(applicant)/dashboard/mentorship/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Calendar,
  MessageSquare,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function MentorshipPage() {
  const { user, profile } = useUserProfile();
  const supabase = createSupabaseClient();
  
  const [mentorshipMatch, setMentorshipMatch] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMentorshipData();
    }
  }, [user]);

  const fetchMentorshipData = async () => {
    try {
      setLoading(true);

      // Fetch active mentorship match
      const { data: match } = await supabase
        .from('mentorship_matches')
        .select('*')
        .eq('mentee_id', profile?.id)
        .in('status', ['active', 'pending'])
        .maybeSingle();

      if (match) {
        // Fetch mentor profile
        const { data: mentorProfile } = await supabase
          .from('profiles')
          .select(`
            *,
            mentor_profiles(*)
          `)
          .eq('id', match.mentor_id)
          .single();

        setMentorshipMatch({ ...match, mentor: mentorProfile });

        // Fetch sessions if active match
        if (match.status === 'active') {
          const { data: sessionData } = await supabase
            .from('mentorship_sessions')
            .select('*')
            .eq('match_id', match.id)
            .order('session_date', { ascending: false })
            .limit(5);

          setSessions(sessionData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching mentorship data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // No mentor yet - Show request mentor flow
  if (!mentorshipMatch) {
    return (
      <ProtectedRoute allowedRoles={['applicant']}>
        <DashboardLayout>
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Mentorship</h2>
              <p className="text-muted-foreground">
                Connect with experienced mentors to guide your journey
              </p>
            </div>

            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Find Your Mentor</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Get personalized guidance from experienced professionals who can help you
                  achieve your educational and career goals.
                </p>
                <Button asChild size="lg">
                  <Link href="/dashboard/mentorship/request">
                    Browse Available Mentors
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Benefits Section */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Personalized Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Receive one-on-one coaching tailored to your specific goals and challenges.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Industry Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Learn from professionals with years of experience in your field of interest.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <MessageSquare className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Regular Check-ins</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Stay on track with scheduled sessions and ongoing support throughout your journey.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Pending match - waiting for approval
  if (mentorshipMatch.status === 'pending') {
    return (
      <ProtectedRoute allowedRoles={['applicant']}>
        <DashboardLayout>
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Mentorship Request</h2>
              <p className="text-muted-foreground">
                Your request is being reviewed
              </p>
            </div>

            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Request Pending</h3>
                    <p className="text-muted-foreground mb-4">
                      We've sent your mentorship request to{' '}
                      <span className="font-medium text-foreground">
                        {mentorshipMatch.mentor?.full_name}
                      </span>
                      . They will review your profile and respond soon.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted on {formatDate(mentorshipMatch.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mentor Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Requested Mentor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {mentorshipMatch.mentor?.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {mentorshipMatch.mentor?.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {mentorshipMatch.mentor?.mentor_profiles?.[0]?.expertise}
                    </p>
                    <p className="text-sm mt-2">
                      {mentorshipMatch.mentor?.mentor_profiles?.[0]?.bio}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Active mentorship - show details and sessions
  return (
    <ProtectedRoute allowedRoles={['applicant']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Mentorship</h2>
            <p className="text-muted-foreground">
              Your journey with {mentorshipMatch.mentor?.full_name}
            </p>
          </div>

          {/* Mentor Info Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">
                    {mentorshipMatch.mentor?.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-2xl font-semibold">
                        {mentorshipMatch.mentor?.full_name}
                      </h3>
                      <p className="text-muted-foreground">
                        {mentorshipMatch.mentor?.mentor_profiles?.[0]?.expertise}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm mb-4">
                    {mentorshipMatch.mentor?.mentor_profiles?.[0]?.bio}
                  </p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      📚 {mentorshipMatch.mentor?.mentor_profiles?.[0]?.years_experience} years experience
                    </span>
                    <span>
                      🤝 Matched since {formatDate(mentorshipMatch.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals & Progress */}
          {mentorshipMatch.goals && (
            <Card>
              <CardHeader>
                <CardTitle>Your Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{mentorshipMatch.goals}</p>
              </CardContent>
            </Card>
          )}

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Sessions</CardTitle>
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/mentorship/sessions">
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sessions scheduled yet</p>
                  <p className="text-sm mt-2">
                    Your mentor will schedule your first session soon
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="font-medium">
                              {formatDate(session.session_date)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.duration_minutes} minutes • {session.mode}
                            </p>
                          </div>
                          <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                        </div>
                        {session.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Contact Your Mentor</CardTitle>
                <CardDescription>
                  Send a message or schedule a session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`mailto:${mentorshipMatch.mentor?.email}`}>
                    Send Message
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Resources</CardTitle>
                <CardDescription>
                  Access shared learning materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/mentorship/resources">
                    View Resources
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}