/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/mentors/matches/page.tsx
 * PURPOSE: View and manage mentorship matches
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Users, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function MentorMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorship_matches')
        .select(`
          *,
          mentor:mentor_profiles!mentor_id (
            *,
            profiles:profiles!user_id (
              full_name,
              avatar_url
            )
          ),
          mentee:profiles!mentee_id (
            full_name,
            avatar_url
          )
        `)
        .order('matched_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-3xl font-bold">Mentorship Matches</h1>
        <p className="text-muted-foreground">View active and pending mentor-mentee matches</p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No matches found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={match.status === 'active' ? 'default' : 'secondary'}>
                    {match.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Matched {formatDate(match.matched_at)}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {/* Mentor */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={match.mentor?.profiles?.avatar_url} />
                      <AvatarFallback>
                        {match.mentor?.profiles?.full_name?.[0] || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{match.mentor?.profiles?.full_name || 'Mentor'}</p>
                      <p className="text-sm text-muted-foreground">Mentor</p>
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-muted-foreground" />

                  {/* Mentee */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium">{match.mentee?.full_name || 'Mentee'}</p>
                      <p className="text-sm text-muted-foreground">Mentee</p>
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={match.mentee?.avatar_url} />
                      <AvatarFallback>
                        {match.mentee?.full_name?.[0] || 'M'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}