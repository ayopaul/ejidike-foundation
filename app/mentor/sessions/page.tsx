/**
 * FILE PATH: /ejdk/ejidike-foundation/app/mentor/sessions/page.tsx
 * PURPOSE: View all mentorship sessions
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Loader2, Plus, Video, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MentorSessionsPage() {
  const { profile } = useUserProfile();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchSessions();
    }
  }, [profile]);

  const fetchSessions = async () => {
    try {
      // First get all mentorship matches for this mentor
      const { data: matches } = await supabase
        .from('mentorship_matches')
        .select('id, mentee_id')
        .eq('mentor_id', profile?.id);

      if (!matches || matches.length === 0) {
        setSessions([]);
        setLoading(false);
        return;
      }

      const matchIds = matches.map(m => m.id);

      // Fetch sessions for these matches
      const { data: sessionsData, error } = await supabase
        .from('mentorship_sessions')
        .select('*')
        .in('match_id', matchIds)
        .order('session_date', { ascending: false });

      if (error) throw error;

      // Fetch mentee profiles
      const menteeIds = matches.map(m => m.mentee_id);
      const { data: menteeProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', menteeIds);

      // Create maps for combining data
      const menteeMap = new Map(menteeProfiles?.map(m => [m.id, m]) || []);
      const matchMap = new Map(matches.map(m => [m.id, { ...m, mentee: menteeMap.get(m.mentee_id) }]) || []);

      // Combine sessions with match and mentee data
      const combinedSessions = sessionsData?.map(session => ({
        ...session,
        match: matchMap.get(session.match_id)
      })) || [];

      setSessions(combinedSessions);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'virtual':
        return <Video className="h-4 w-4" />;
      case 'in-person':
        return <MapPin className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground">Track your mentorship sessions</p>
        </div>
        <Link href="/mentor/sessions/log">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Log Session
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No sessions logged yet</p>
            <Link href="/mentor/sessions/log">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Session
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Session with {session.match?.mentee?.full_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(session.session_date)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {session.duration} mins
                      </span>
                      <span className="flex items-center">
                        {getModeIcon(session.mode)}
                        <span className="ml-1 capitalize">{session.mode}</span>
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              {session.notes && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{session.notes}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}