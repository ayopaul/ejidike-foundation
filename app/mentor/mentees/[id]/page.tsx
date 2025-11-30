/**
 * FILE PATH: /ejdk/ejidike-foundation/app/mentor/mentees/[id]/page.tsx
 * PURPOSE: View mentee details and session history
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, Clock, Loader2, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MentorMenteeDetailPage() {
  const params = useParams();
  const [match, setMatch] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchMatch();
      fetchSessions();
    }
  }, [params.id]);

  const fetchMatch = async () => {
    try {
      // Fetch the mentorship match
      const { data: matchData, error } = await supabase
        .from('mentorship_matches')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      // Fetch mentee profile separately
      if (matchData) {
        const { data: menteeData } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, phone')
          .eq('id', matchData.mentee_id)
          .single();

        setMatch({
          ...matchData,
          mentee: menteeData
        });
      }
    } catch (error: any) {
      console.error('Error fetching match:', error);
      toast.error('Failed to load mentee details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select('*')
        .eq('match_id', params.id)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Mentee not found</p>
        <Link href="/mentor/mentees">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mentees
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/mentor/mentees">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mentees
        </Button>
      </Link>

      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={match.mentee?.avatar_url} />
          <AvatarFallback className="text-2xl">
            {match.mentee?.full_name?.[0] || 'M'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{match.mentee?.full_name}</h1>
          <Badge className="mt-2">{match.status}</Badge>
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{match.mentee?.email}</p>
            </div>
          </div>
          {match.mentee?.phone && (
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-3 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{match.mentee.phone}</p>
              </div>
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Matched Since</p>
              <p className="text-sm text-muted-foreground">{formatDate(match.start_date || match.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} completed
              </CardDescription>
            </div>
            <Link href={`/mentor/sessions/log?match=${params.id}`}>
              <Button size="sm">Log New Session</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No sessions logged yet
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(session.session_date)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {session.duration} mins
                      </div>
                    </div>
                    <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{session.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}