/**
 * FILE PATH: /ejdk/ejidike-foundation/app/mentor/mentees/page.tsx
 * PURPOSE: List all mentees for this mentor
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Loader2, Users, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MentorMenteesPage() {
  const { user } = useUserProfile();
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMentees();
    }
  }, [user]);

  const fetchMentees = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorship_matches')
        .select(`
          *,
          mentee:profiles!mentee_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('mentor_id', user?.id)
        .order('matched_at', { ascending: false });

      if (error) throw error;
      setMentees(data || []);
    } catch (error: any) {
      console.error('Error fetching mentees:', error);
      toast.error('Failed to load mentees');
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
        <h1 className="text-3xl font-bold">My Mentees</h1>
        <p className="text-muted-foreground">View and manage your mentees</p>
      </div>

      {mentees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No mentees assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mentees.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={match.mentee?.avatar_url} />
                    <AvatarFallback>
                      {match.mentee?.full_name?.[0] || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{match.mentee?.full_name}</CardTitle>
                    <CardDescription className="mt-1">{match.mentee?.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant={match.status === 'active' ? 'default' : 'secondary'}>
                    {match.status}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Since {formatDate(match.matched_at)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/mentor/mentees/${match.id}`}>
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}