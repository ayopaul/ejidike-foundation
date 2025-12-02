/**
 * FILE PATH: /ejdk/ejidike-foundation/app/mentor/my-events/page.tsx
 * PURPOSE: Mentor's registered events
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Loader2, Clock, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import Link from 'next/link';

const EVENT_TYPES = [
  { value: 'webinar', label: 'Webinar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'conference', label: 'Conference' },
  { value: 'networking', label: 'Networking' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' }
];

const getEventTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    webinar: 'bg-blue-100 text-blue-800',
    workshop: 'bg-purple-100 text-purple-800',
    conference: 'bg-green-100 text-green-800',
    networking: 'bg-orange-100 text-orange-800',
    training: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800'
  };
  return colors[type] || colors.other;
};

export default function MentorMyEventsPage() {
  const { profile } = useUserProfile();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchMyEvents();
    }
  }, [profile]);

  const fetchMyEvents = async () => {
    if (!profile) return;

    try {
      const { data: registrationsData, error: regError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', profile.id)
        .neq('status', 'cancelled');

      if (regError) throw regError;

      if (registrationsData && registrationsData.length > 0) {
        const eventIds = registrationsData.map(r => r.event_id);
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds);

        if (eventsError) throw eventsError;

        const combined = registrationsData.map(reg => {
          const event = eventsData?.find(e => e.id === reg.event_id);
          return { ...reg, event };
        });

        setRegistrations(combined);
      } else {
        setRegistrations([]);
      }
    } catch (error: any) {
      console.error('Error fetching my events:', error);
      toast.error('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('user_id', profile.id);

      if (error) throw error;

      const registration = registrations.find(r => r.event_id === eventId);
      if (registration?.event && registration.event.current_participants > 0) {
        await supabase
          .from('events')
          .update({ current_participants: registration.event.current_participants - 1 })
          .eq('id', eventId);
      }

      toast.success('Registration cancelled');
      fetchMyEvents();
    } catch (error: any) {
      console.error('Error cancelling registration:', error);
      toast.error('Failed to cancel registration');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const now = new Date();
  const upcomingEvents = registrations.filter(r => r.event && new Date(r.event.event_date) >= now);
  const pastEvents = registrations.filter(r => r.event && new Date(r.event.event_date) < now);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground">Events you're registered for</p>
        </div>
        <Button asChild>
          <Link href="/events">Browse All Events</Link>
        </Button>
      </div>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">You haven't registered for any events yet</p>
            <Button asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {upcomingEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Upcoming Events</h2>
              <div className="grid gap-4">
                {upcomingEvents.map((registration) => {
                  const event = registration.event;
                  if (!event) return null;

                  const eventDate = new Date(event.event_date);
                  const endDate = event.end_date ? new Date(event.end_date) : null;

                  return (
                    <Card key={registration.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-xl">{event.title}</CardTitle>
                              <Badge className={getEventTypeColor(event.event_type)}>
                                {EVENT_TYPES.find(t => t.value === event.event_type)?.label || event.event_type}
                              </Badge>
                              <Badge variant="default">Registered</Badge>
                            </div>
                            <CardDescription>{event.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {eventDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {eventDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {endDate && ` - ${endDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}`}
                            </span>
                          </div>

                          {event.location && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>{event.location}</span>
                            </div>
                          )}

                          {event.meeting_link && (
                            <div className="flex items-center gap-2">
                              <ExternalLink className="h-4 w-4 flex-shrink-0 text-primary" />
                              <a
                                href={event.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium"
                              >
                                Join Meeting
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="pt-2">
                          <Button
                            variant="outline"
                            onClick={() => handleCancelRegistration(event.id)}
                            className="w-full"
                          >
                            Cancel Registration
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Past Events</h2>
              <div className="grid gap-4">
                {pastEvents.map((registration) => {
                  const event = registration.event;
                  if (!event) return null;

                  const eventDate = new Date(event.event_date);

                  return (
                    <Card key={registration.id} className="opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <Badge className={getEventTypeColor(event.event_type)}>
                                {EVENT_TYPES.find(t => t.value === event.event_type)?.label || event.event_type}
                              </Badge>
                              <Badge variant="outline">Past Event</Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {eventDate.toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
