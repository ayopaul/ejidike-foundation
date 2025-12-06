/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/content/events/page.tsx
 * PURPOSE: Manage events
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Edit, Trash2, Loader2, Calendar, MapPin, Users, Link as LinkIcon, ImageIcon, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import Image from 'next/image';

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

export default function EventsPage() {
  const { profile } = useUserProfile();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'webinar',
    event_date: '',
    event_time: '10:00',
    end_date: '',
    end_time: '',
    location: '',
    meeting_link: '',
    max_participants: '',
    registration_deadline: '',
    is_published: false,
    image_url: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Combine date and time
      const eventDateTime = formData.event_date && formData.event_time
        ? `${formData.event_date}T${formData.event_time}:00`
        : null;

      const endDateTime = formData.end_date && formData.end_time
        ? `${formData.end_date}T${formData.end_time}:00`
        : null;

      const eventData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        event_date: eventDateTime,
        end_date: endDateTime,
        location: formData.location || null,
        meeting_link: formData.meeting_link || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        registration_deadline: formData.registration_deadline || null,
        is_published: formData.is_published,
        image_url: formData.image_url || null,
        created_by: profile?.id
      };

      if (editingId) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Event updated');
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData);

        if (error) throw error;
        toast.success('Event created');
      }

      setDialogOpen(false);
      setEditingId(null);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event: any) => {
    // Parse datetime
    const eventDate = event.event_date ? new Date(event.event_date) : null;
    const endDate = event.end_date ? new Date(event.end_date) : null;

    setFormData({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      event_date: eventDate ? eventDate.toISOString().split('T')[0] : '',
      event_time: eventDate ? eventDate.toTimeString().slice(0, 5) : '10:00',
      end_date: endDate ? endDate.toISOString().split('T')[0] : '',
      end_time: endDate ? endDate.toTimeString().slice(0, 5) : '',
      location: event.location || '',
      meeting_link: event.meeting_link || '',
      max_participants: event.max_participants?.toString() || '',
      registration_deadline: event.registration_deadline || '',
      is_published: event.is_published,
      image_url: event.image_url || ''
    });
    setEditingId(event.id);
    setDialogOpen(true);
  };

  const handleNewEvent = () => {
    resetForm();
    setEditingId(null);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'webinar',
      event_date: '',
      event_time: '10:00',
      end_date: '',
      end_time: '',
      location: '',
      meeting_link: '',
      max_participants: '',
      registration_deadline: '',
      is_published: false,
      image_url: ''
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a JPG, PNG, or WebP image'
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large', {
        description: 'Please upload an image smaller than 5MB'
      });
      return;
    }

    setUploadingImage(true);
    console.log('Starting upload...');

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `event-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `events/${fileName}`;

      console.log('Uploading to:', filePath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('Upload response:', { uploadData, uploadError });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image', {
        description: error.message || 'Please try again'
      });
    } finally {
      console.log('Upload finished');
      setUploadingImage(false);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event? All registrations will also be deleted.')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Event deleted');
      fetchEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentStatus ? 'Event unpublished' : 'Event published');
      fetchEvents();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Events</h1>
              <p className="text-muted-foreground">Manage events and workshops</p>
            </div>
            <div className="flex gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {EVENT_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleNewEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit' : 'Create'} Event</DialogTitle>
                    <DialogDescription>
                      {editingId ? 'Update the event details below.' : 'Add a new event.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        required
                      />
                    </div>

                    {/* Event Thumbnail */}
                    <div className="space-y-2">
                      <Label>Event Thumbnail</Label>
                      <p className="text-xs text-muted-foreground">
                        Upload an image to display on the events page (JPG, PNG, WebP, max 5MB)
                      </p>

                      {formData.image_url ? (
                        <div className="relative rounded-lg overflow-hidden border">
                          <div className="relative h-40 w-full">
                            <Image
                              src={formData.image_url}
                              alt="Event thumbnail preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute top-2 right-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={handleRemoveImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                          <input
                            type="file"
                            id="event-image-upload"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                          <label
                            htmlFor="event-image-upload"
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            {uploadingImage ? (
                              <>
                                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                                <span className="text-sm text-muted-foreground">Uploading...</span>
                              </>
                            ) : (
                              <>
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                <div className="text-sm">
                                  <span className="text-primary font-medium">Click to upload</span>
                                  <span className="text-muted-foreground"> a thumbnail image</span>
                                </div>
                              </>
                            )}
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Event Type *</Label>
                        <Select
                          value={formData.event_type}
                          onValueChange={(val) => setFormData({ ...formData, event_type: val })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EVENT_TYPES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Max Participants</Label>
                        <Input
                          type="number"
                          placeholder="Leave empty for unlimited"
                          value={formData.max_participants}
                          onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date *</Label>
                        <Input
                          type="date"
                          value={formData.event_date}
                          onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Time *</Label>
                        <Input
                          type="time"
                          value={formData.event_time}
                          onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={formData.end_time}
                          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        placeholder="Virtual, City Hall, etc."
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Meeting Link</Label>
                      <Input
                        type="url"
                        placeholder="https://zoom.us/j/..."
                        value={formData.meeting_link}
                        onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Registration Deadline</Label>
                      <Input
                        type="datetime-local"
                        value={formData.registration_deadline}
                        onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_published"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="is_published" className="cursor-pointer">
                        Publish event (make visible to users)
                      </Label>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Event</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {events.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No events yet. Create your first event!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {events
                .filter((event) => typeFilter === 'all' || event.event_type === typeFilter)
                .map((event) => {
                  const eventDate = new Date(event.event_date);
                  const isPast = eventDate < new Date();

                  return (
                    <Card key={event.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          {/* Thumbnail preview */}
                          {event.image_url && (
                            <div className="relative h-20 w-32 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={event.image_url}
                                alt={event.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <Badge className={getEventTypeColor(event.event_type)}>
                                {EVENT_TYPES.find(t => t.value === event.event_type)?.label || event.event_type}
                              </Badge>
                              {event.is_published ? (
                                <Badge variant="default">Published</Badge>
                              ) : (
                                <Badge variant="secondary">Draft</Badge>
                              )}
                              {isPast && <Badge variant="outline">Past Event</Badge>}
                            </div>
                            <CardDescription>{event.description}</CardDescription>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {eventDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.location}
                                </div>
                              )}
                              {event.max_participants && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {event.current_participants || 0} / {event.max_participants}
                                </div>
                              )}
                              {event.meeting_link && (
                                <div className="flex items-center gap-1">
                                  <LinkIcon className="h-4 w-4" />
                                  <a
                                    href={event.meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    Meeting Link
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={event.is_published ? "outline" : "default"}
                              onClick={() => togglePublish(event.id, event.is_published)}
                            >
                              {event.is_published ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
