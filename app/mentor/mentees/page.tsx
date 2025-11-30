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
import { Eye, Loader2, Users, Calendar, Check, X, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import { createNotification } from '@/lib/notifications';
import { sendEmail } from '@/lib/email';
import { mentorshipRequestAcceptedEmail, mentorshipRequestRejectedEmail } from '@/lib/email-templates';

export default function MentorMenteesPage() {
  const { profile } = useUserProfile();
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (profile) {
      fetchMentees();
    }
  }, [profile, statusFilter]);

  const fetchMentees = async () => {
    try {
      // Fetch mentorship matches
      let query = supabase
        .from('mentorship_matches')
        .select('*')
        .eq('mentor_id', profile?.id);

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: matches, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch mentee profiles separately
      if (matches && matches.length > 0) {
        const menteeIds = matches.map(m => m.mentee_id);
        const { data: menteeProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', menteeIds);

        // Combine matches with mentee data
        const menteesMap = new Map(menteeProfiles?.map(m => [m.id, m]) || []);
        const combinedData = matches.map(match => ({
          ...match,
          mentee: menteesMap.get(match.mentee_id)
        }));

        setMentees(combinedData);
      } else {
        setMentees([]);
      }
    } catch (error: any) {
      console.error('Error fetching mentees:', error);
      toast.error('Failed to load mentees');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (match: any) => {
    try {
      // Update match status to active
      const { error } = await supabase
        .from('mentorship_matches')
        .update({ status: 'active' })
        .eq('id', match.id);

      if (error) throw error;

      // Send in-app notification to mentee
      try {
        await createNotification({
          userId: match.mentee_id,
          title: 'Mentorship Request Accepted',
          message: `${profile?.full_name} has accepted your mentorship request!`,
          type: 'success',
          link: '/mentorship'
        });
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }

      // Send email to mentee
      try {
        const email = mentorshipRequestAcceptedEmail({
          menteeName: match.mentee?.full_name || 'Mentee',
          mentorName: profile?.full_name || 'Mentor',
          mentorEmail: profile?.email || ''
        });

        await sendEmail({
          to: match.mentee?.email || '',
          toName: match.mentee?.full_name,
          subject: email.subject,
          html: email.html,
          text: email.text
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }

      toast.success('Mentorship request accepted');
      fetchMentees();
    } catch (error: any) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (match: any) => {
    try {
      // Update match status to rejected
      const { error } = await supabase
        .from('mentorship_matches')
        .update({ status: 'rejected' })
        .eq('id', match.id);

      if (error) throw error;

      // Send in-app notification to mentee
      try {
        await createNotification({
          userId: match.mentee_id,
          title: 'Mentorship Request Update',
          message: `${profile?.full_name} is unable to accept your mentorship request at this time`,
          type: 'info',
          link: '/mentorship'
        });
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }

      // Send email to mentee
      try {
        const email = mentorshipRequestRejectedEmail({
          menteeName: match.mentee?.full_name || 'Mentee',
          mentorName: profile?.full_name || 'Mentor'
        });

        await sendEmail({
          to: match.mentee?.email || '',
          toName: match.mentee?.full_name,
          subject: email.subject,
          html: email.html,
          text: email.text
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }

      toast.success('Mentorship request declined');
      fetchMentees();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to decline request');
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
          <h1 className="text-3xl font-bold">My Mentees</h1>
          <p className="text-muted-foreground">View and manage your mentees</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                    Since {formatDate(match.start_date || match.created_at)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {match.status === 'pending' ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAcceptRequest(match)}
                      className="flex-1"
                      size="sm"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleRejectRequest(match)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                ) : (
                  <Link href={`/mentor/mentees/${match.id}`}>
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}