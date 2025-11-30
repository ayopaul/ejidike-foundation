/**
 * FILE PATH: /ejdk/ejidike-foundation/app/(applicant)/mentorship/page.tsx
 * PURPOSE: Request mentorship and view mentor matches
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MessageSquare, Calendar, Loader2, X, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner';
import { createNotification } from '@/lib/notifications';
import { sendEmail } from '@/lib/email';
import { mentorshipRequestReceivedEmail, mentorshipRequestSentEmail } from '@/lib/email-templates';

export default function MentorshipPage() {
  const { user, profile } = useUserProfile();
  const [mentorMatch, setMentorMatch] = useState<any>(null);
  const [availableMentors, setAvailableMentors] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchMentorMatch();
      fetchAvailableMentors();
    }
  }, [profile]);

  const fetchMentorMatch = async () => {
    try {
      // First get the mentorship match (exclude withdrawn and rejected)
      const { data: match, error: matchError } = await supabase
        .from('mentorship_matches')
        .select('*')
        .eq('mentee_id', profile?.id)
        .in('status', ['active', 'pending'])
        .maybeSingle();

      if (matchError) throw matchError;

      if (match) {
        // Fetch mentor's profile separately
        const { data: mentorProfile } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .eq('id', match.mentor_id)
          .single();

        // Fetch mentor's mentor_profile separately
        const { data: mentorProfileData } = await supabase
          .from('mentor_profiles')
          .select('*')
          .eq('user_id', match.mentor_id)
          .maybeSingle();

        // Combine the data
        setMentorMatch({
          ...match,
          mentor: {
            ...mentorProfile,
            mentor_profiles: mentorProfileData ? [mentorProfileData] : []
          }
        });

        // Fetch sessions for this mentorship
        const { data: sessionsData } = await supabase
          .from('mentorship_sessions')
          .select('*')
          .eq('match_id', match.id)
          .order('session_date', { ascending: false });

        setSessions(sessionsData || []);
      } else {
        setMentorMatch(null);
        setSessions([]);
      }
    } catch (error: any) {
      console.error('Error fetching mentor match:', error);
    }
  };

  const fetchAvailableMentors = async () => {
    try {
      // Get available mentor profiles (separate queries to avoid FK join issues)
      const { data: mentorProfiles, error } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('availability_status', 'available')
        .limit(6);

      if (error) throw error;

      // If we have mentor profiles, fetch the user profiles separately
      if (mentorProfiles && mentorProfiles.length > 0) {
        const userIds = mentorProfiles.map(mp => mp.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, email')
          .in('id', userIds);

        // Combine the data
        const mentorsWithProfiles = mentorProfiles.map(mp => ({
          ...mp,
          profiles: profiles?.find(p => p.id === mp.user_id)
        }));

        setAvailableMentors(mentorsWithProfiles);
      } else {
        setAvailableMentors([]);
      }
    } catch (error: any) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestMentor = async (mentorProfileId: string) => {
    if (!profile) return;

    try {
      console.log('[Mentorship] Starting mentor request for:', mentorProfileId);

      // Get mentor's profile details
      const { data: mentorProfile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', mentorProfileId)
        .single();

      console.log('[Mentorship] Mentor profile fetched:', mentorProfile);

      if (!mentorProfile) {
        throw new Error('Mentor profile not found');
      }

      // Create the mentorship match
      console.log('[Mentorship] Creating mentorship match...');
      const { error } = await supabase
        .from('mentorship_matches')
        .insert({
          mentor_id: mentorProfileId,
          mentee_id: profile.id,
          status: 'pending',
          start_date: new Date().toISOString()
        });

      if (error) {
        console.error('[Mentorship] Error creating match:', error);
        throw error;
      }

      console.log('[Mentorship] Match created successfully');

      // Send in-app notification to mentor
      console.log('[Mentorship] About to create notification for mentor:', mentorProfileId);
      console.log('[Mentorship] Profile full_name:', profile.full_name);
      try {
        const mentorNotification = await createNotification({
          userId: mentorProfileId,
          title: 'New Mentorship Request',
          message: `${profile.full_name} has requested you as their mentor`,
          type: 'info',
          link: '/mentor/mentees'
        });
        console.log('✅ [Mentorship] Mentor notification created successfully:', mentorNotification);
      } catch (notifError: any) {
        console.error('❌ [Mentorship] Error sending notification to mentor:');
        console.error('Error object:', notifError);
        console.error('Error message:', notifError?.message);
        console.error('Error code:', notifError?.code);
        console.error('Error details:', notifError?.details);
        // Don't fail the whole request, just log the error
      }

      // Send email to mentor
      try {
        const mentorEmail = mentorshipRequestReceivedEmail({
          mentorName: mentorProfile.full_name || 'Mentor',
          menteeName: profile.full_name || 'Mentee',
          menteeEmail: profile.email || '',
          menteeBio: undefined
        });

        await sendEmail({
          to: mentorProfile.email || '',
          toName: mentorProfile.full_name,
          subject: mentorEmail.subject,
          html: mentorEmail.html,
          text: mentorEmail.text
        });
      } catch (emailError) {
        console.error('Error sending email to mentor:', emailError);
      }

      // Send in-app notification to mentee (confirmation)
      try {
        console.log('[Mentorship] Creating notification for mentee:', profile.id);
        await createNotification({
          userId: profile.id,
          title: 'Mentorship Request Sent',
          message: `Your request to ${mentorProfile.full_name} has been sent`,
          type: 'success',
          link: '/mentorship'
        });
        console.log('[Mentorship] Notification created successfully for mentee');
      } catch (notifError) {
        console.error('❌ Error sending notification to mentee:', notifError);
        // Don't fail the whole request, just log the error
      }

      // Send email to mentee (confirmation)
      try {
        const menteeEmail = mentorshipRequestSentEmail({
          menteeName: profile.full_name || 'Mentee',
          mentorName: mentorProfile.full_name || 'Mentor'
        });

        await sendEmail({
          to: profile.email || '',
          toName: profile.full_name,
          subject: menteeEmail.subject,
          html: menteeEmail.html,
          text: menteeEmail.text
        });
      } catch (emailError) {
        console.error('Error sending email to mentee:', emailError);
      }

      toast.success('Mentorship request sent', {
        description: 'The mentor will be notified of your request'
      });

      fetchMentorMatch();
    } catch (error: any) {
      console.error('Error requesting mentor:', error);
      toast.error('Failed to send request', {
        description: error.message
      });
    }
  };

  const withdrawRequest = async () => {
    if (!mentorMatch) return;

    try {
      console.log('[Mentorship] Withdrawing request:', mentorMatch.id);

      // Update status to withdrawn instead of deleting
      const { data, error } = await supabase
        .from('mentorship_matches')
        .update({ status: 'withdrawn' })
        .eq('id', mentorMatch.id)
        .select();

      if (error) {
        console.error('[Mentorship] Error updating status:', error);
        throw error;
      }

      console.log('[Mentorship] Status updated successfully:', data);

      // Notify mentor about withdrawal
      try {
        await createNotification({
          userId: mentorMatch.mentor_id,
          title: 'Mentorship Request Withdrawn',
          message: `${profile?.full_name} has withdrawn their mentorship request`,
          type: 'info',
          link: '/mentor/mentees'
        });
      } catch (notifError) {
        console.error('Error notifying mentor:', notifError);
      }

      // Clear the mentor match immediately and don't refetch
      // (the match is now withdrawn, so it won't show up in the query anyway)
      setMentorMatch(null);

      toast.success('Request withdrawn');

      // Refresh available mentors list
      await fetchAvailableMentors();
    } catch (error: any) {
      console.error('Error withdrawing request:', error);
      toast.error('Failed to withdraw request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mentorship</h1>
        <p className="text-muted-foreground mt-2">
          Connect with experienced mentors to guide your journey
        </p>
      </div>

      {/* Current Mentor */}
      {mentorMatch && (
        <Card>
          <CardHeader>
            <CardTitle>Your Mentor</CardTitle>
            <CardDescription>
              {mentorMatch.status === 'active' ? 'Currently mentoring you' : 'Request pending'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={mentorMatch.mentor?.avatar_url} />
                <AvatarFallback>
                  {mentorMatch.mentor?.full_name?.[0] || 'M'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {mentorMatch.mentor?.full_name || 'Mentor'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {mentorMatch.mentor?.mentor_profiles?.[0]?.expertise_areas?.join(', ') || 'Expert Mentor'}
                </p>
                <Badge variant={mentorMatch.status === 'active' ? 'default' : 'secondary'} className="mt-2">
                  {mentorMatch.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                {mentorMatch.status === 'active' && (
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                )}
                {mentorMatch.status === 'pending' && (
                  <Button variant="outline" onClick={withdrawRequest}>
                    <X className="h-4 w-4 mr-2" />
                    Withdraw Request
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Mentors */}
      {!mentorMatch && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Available Mentors</CardTitle>
              <CardDescription>
                Browse and request mentorship from experienced professionals
              </CardDescription>
            </CardHeader>
          </Card>

          {availableMentors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No mentors available at the moment</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableMentors.map((mentor) => (
                <Card key={mentor.profiles?.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={mentor.profiles?.avatar_url} />
                        <AvatarFallback>
                          {mentor.profiles?.full_name?.[0] || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {mentor.profiles?.full_name || 'Mentor'}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {mentor.expertise_areas?.join(', ') || 'Mentor'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {mentor.bio || 'Experienced professional ready to guide and support mentees.'}
                    </p>
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => requestMentor(mentor.profiles?.id)}
                    >
                      Request Mentor
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Sessions Section - Only show if there's an active mentor */}
      {mentorMatch && mentorMatch.status === 'active' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mentorship Sessions</CardTitle>
                <CardDescription>
                  Sessions with {mentorMatch.mentor?.full_name}
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
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>How Mentorship Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">1. Request a Mentor</h4>
                <p className="text-sm text-muted-foreground">
                  Browse available mentors and send a request
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">2. Get Matched</h4>
                <p className="text-sm text-muted-foreground">
                  Wait for the mentor to accept your request
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">3. Schedule Sessions</h4>
                <p className="text-sm text-muted-foreground">
                  Meet regularly and work towards your goals
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}