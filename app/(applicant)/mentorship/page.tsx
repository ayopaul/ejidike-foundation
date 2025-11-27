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
import { Users, MessageSquare, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner';

export default function MentorshipPage() {
  const { user } = useUserProfile();
  const [mentorMatch, setMentorMatch] = useState<any>(null);
  const [availableMentors, setAvailableMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMentorMatch();
      fetchAvailableMentors();
    }
  }, [user]);

  const fetchMentorMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorship_matches')
        .select(`
          *,
          mentor:mentor_profiles(
            *,
            profiles(full_name, avatar_url)
          )
        `)
        .eq('mentee_id', user?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      setMentorMatch(data);
    } catch (error: any) {
      console.error('Error fetching mentor match:', error);
    }
  };

  const fetchAvailableMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .eq('availability_status', 'available')
        .limit(6);

      if (error) throw error;
      setAvailableMentors(data || []);
    } catch (error: any) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestMentor = async (mentorId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('mentorship_matches')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          status: 'pending',
          matched_at: new Date().toISOString()
        });

      if (error) throw error;

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
                <AvatarImage src={mentorMatch.mentor?.profiles?.avatar_url} />
                <AvatarFallback>
                  {mentorMatch.mentor?.profiles?.full_name?.[0] || 'M'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {mentorMatch.mentor?.profiles?.full_name || 'Mentor'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {mentorMatch.mentor?.expertise || 'Expert Mentor'}
                </p>
                <Badge variant={mentorMatch.status === 'active' ? 'default' : 'secondary'} className="mt-2">
                  {mentorMatch.status}
                </Badge>
              </div>
              {mentorMatch.status === 'active' && (
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
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
                <Card key={mentor.id}>
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
                          {mentor.expertise}
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
                      onClick={() => requestMentor(mentor.user_id)}
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