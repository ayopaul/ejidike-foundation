/**
 * FILE PATH: /ejdk/ejidike-foundation/app/mentor/sessions/log/page.tsx
 * PURPOSE: Log a new mentorship session
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import Link from 'next/link';
import { toast } from 'sonner';
import { createNotification } from '@/lib/notifications';

export default function LogSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useUserProfile();
  const matchId = searchParams.get('match');

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    match_id: matchId || '',
    session_date: new Date().toISOString().split('T')[0],
    session_time: '10:00',
    duration: '',
    mode: 'virtual',
    notes: ''
  });

  useEffect(() => {
    if (profile) {
      fetchMatches();
    }
  }, [profile]);

  const fetchMatches = async () => {
    try {
      // Fetch mentorship matches
      const { data: matchesData, error } = await supabase
        .from('mentorship_matches')
        .select('*')
        .eq('mentor_id', profile?.id)
        .eq('status', 'active');

      if (error) throw error;

      // Fetch mentee profiles separately
      if (matchesData && matchesData.length > 0) {
        const menteeIds = matchesData.map(m => m.mentee_id);
        const { data: menteeProfiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', menteeIds);

        // Combine matches with mentee data
        const menteesMap = new Map(menteeProfiles?.map(m => [m.id, m]) || []);
        const combinedData = matchesData.map(match => ({
          ...match,
          mentee: menteesMap.get(match.mentee_id)
        }));
        setMatches(combinedData);
      } else {
        setMatches([]);
      }
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load mentees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.match_id || !formData.duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      // Combine date and time into a single datetime
      const sessionDateTime = `${formData.session_date}T${formData.session_time}:00`;

      console.log('[Session Log] Inserting session:', {
        match_id: formData.match_id,
        session_date: sessionDateTime,
        duration_minutes: parseInt(formData.duration),
        mode: formData.mode,
        notes: formData.notes
      });

      const { data, error } = await supabase
        .from('mentorship_sessions')
        .insert({
          match_id: formData.match_id,
          session_date: sessionDateTime,
          duration_minutes: parseInt(formData.duration),
          mode: formData.mode,
          notes: formData.notes
        })
        .select();

      if (error) {
        console.error('[Session Log] Error:', error);
        throw error;
      }

      console.log('[Session Log] Session created successfully:', data);

      // Get the mentee ID from the selected match
      const selectedMatch = matches.find(m => m.id === formData.match_id);
      const menteeId = selectedMatch?.mentee_id;
      const menteeName = selectedMatch?.mentee?.full_name;

      // Send notification to mentee
      if (menteeId) {
        try {
          await createNotification({
            userId: menteeId,
            title: 'New Session Logged',
            message: `${profile?.full_name || 'Your mentor'} has logged a ${parseInt(formData.duration)} minute session with you`,
            type: 'info',
            link: '/mentorship'
          });
          console.log('[Session Log] Notification sent to mentee');
        } catch (notifError) {
          console.error('[Session Log] Error sending notification:', notifError);
          // Don't fail the session logging if notification fails
        }
      }

      toast.success('Session logged successfully');
      router.push('/mentor/sessions');
    } catch (error: any) {
      console.error('Error logging session:', error);
      toast.error('Failed to log session');
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link href="/mentor/sessions">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sessions
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Log Session</h1>
        <p className="text-muted-foreground">Record a mentorship session</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>Enter the details of your mentorship session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="match_id">Mentee *</Label>
              <Select 
                value={formData.match_id} 
                onValueChange={(val) => setFormData({ ...formData, match_id: val })}
                disabled={!!matchId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mentee" />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      {match.mentee?.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session_date">Session Date *</Label>
                <Input
                  id="session_date"
                  type="date"
                  value={formData.session_date}
                  onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_time">Session Time *</Label>
                <Input
                  id="session_time"
                  type="time"
                  value={formData.session_time}
                  onChange={(e) => setFormData({ ...formData, session_time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="60"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Session Mode *</Label>
              <Select 
                value={formData.mode} 
                onValueChange={(val) => setFormData({ ...formData, mode: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Session Notes</Label>
              <Textarea
                id="notes"
                placeholder="Key discussion points, goals set, next steps..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 mt-6">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Log Session
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}