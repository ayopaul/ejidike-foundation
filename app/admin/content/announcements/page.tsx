/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/content/announcements/page.tsx
 * PURPOSE: Manage site announcements
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Edit, Trash2, Loader2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Database, Announcement } from '@/types/database';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    is_active: false,
    expires_at: null as Date | null
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements((data || []) as Announcement[]);
    } catch (error: any) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const supabase = createClientComponentClient<Database>();

      // If activating this announcement, deactivate all others first
      if (formData.is_active) {
        await supabase
          .from('announcements')
          .update({ is_active: false })
          .neq('id', editingId || '');
      }

      const submitData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        is_active: formData.is_active,
        expires_at: formData.expires_at ? formData.expires_at.toISOString() : null
      };

      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update(submitData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Announcement updated');
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert(submitData);

        if (error) throw error;
        toast.success('Announcement created');
      }

      setDialogOpen(false);
      setEditingId(null);
      setFormData({ title: '', message: '', type: 'info', is_active: false, expires_at: null });
      fetchAnnouncements();
    } catch (error: any) {
      toast.error('Failed to save announcement');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      is_active: announcement.is_active,
      expires_at: announcement.expires_at ? new Date(announcement.expires_at) : null
    });
    setEditingId(announcement.id);
    setDialogOpen(true);
  };

  const handleNewAnnouncement = () => {
    setFormData({ title: '', message: '', type: 'info', is_active: false, expires_at: null });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;

    try {
      const supabase = createClientComponentClient<Database>();
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error: any) {
      toast.error('Failed to delete announcement');
    }
  };

  const toggleActive = async (announcement: Announcement) => {
    try {
      const supabase = createClientComponentClient<Database>();
      const newActiveState = !announcement.is_active;

      // If activating, deactivate all others first
      if (newActiveState) {
        await supabase
          .from('announcements')
          .update({ is_active: false })
          .neq('id', announcement.id);
      }

      const { error } = await supabase
        .from('announcements')
        .update({ is_active: newActiveState })
        .eq('id', announcement.id);

      if (error) throw error;
      toast.success(`Announcement ${announcement.is_active ? 'deactivated' : 'activated'}`);
      fetchAnnouncements();
    } catch (error: any) {
      toast.error('Failed to update announcement');
    }
  };

  const getStatus = (announcement: Announcement) => {
    if (!announcement.is_active) return 'inactive';
    if (announcement.expires_at && new Date(announcement.expires_at) < new Date()) return 'expired';
    return 'active';
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
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Manage site-wide announcements</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewAnnouncement}>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Create'} Announcement</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the announcement details below.' : 'Add a new site-wide announcement.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title (for internal reference)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Grant Cycle 2025"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Message (shown on website)</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="This text will be displayed in the announcement bar"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Expires At (optional)</Label>
                <DatePicker
                  date={formData.expires_at}
                  onDateChange={(date) => setFormData({ ...formData, expires_at: date || null })}
                  placeholder="Select expiry date"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for no expiration. The announcement will automatically hide after this date.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Set as Active</Label>
              </div>
              {formData.is_active && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Only one announcement can be active at a time. Activating this will deactivate any other active announcement.
                  </p>
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No announcements yet</p>
            <Button className="mt-4" onClick={handleNewAnnouncement}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const status = getStatus(announcement);
            return (
              <Card key={announcement.id} className={status === 'inactive' ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        {status === 'active' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                        {status === 'expired' && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                        {status === 'inactive' && (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Created {formatDate(announcement.created_at)}
                        {announcement.expires_at && (
                          <span className="ml-2">
                            · Expires {formatDate(announcement.expires_at)}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={announcement.is_active}
                        onCheckedChange={() => toggleActive(announcement)}
                      />
                      <Button size="sm" variant="outline" onClick={() => handleEdit(announcement)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(announcement.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#FFCF4C] rounded-md px-4 py-2 text-sm text-black">
                    {announcement.message}
                  </div>
                </CardContent>
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