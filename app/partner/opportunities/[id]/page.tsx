/**
 * FILE PATH: /ejdk/ejidike-foundation/app/partner/opportunities/[id]/page.tsx
 * PURPOSE: Edit opportunity details
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'internship',
    location: '',
    remote_option: false,
    application_deadline: '',
    application_link: '',
    requirements: '',
    status: 'open'
  });

  useEffect(() => {
    if (params.id) {
      fetchOpportunity();
    }
  }, [params.id]);

  const fetchOpportunity = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_opportunities')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setFormData({
        title: data.title,
        description: data.description || '',
        type: data.type,
        location: data.location || '',
        remote_option: data.remote_option || false,
        application_deadline: data.application_deadline?.split('T')[0] || '',
        application_link: data.application_link || '',
        requirements: data.requirements ? data.requirements.join(', ') : '',
        status: data.status
      });
    } catch (error: any) {
      console.error('Error fetching opportunity:', error);
      toast.error('Failed to load opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('partner_opportunities')
        .update({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          location: formData.location,
          remote_option: formData.remote_option,
          application_deadline: formData.application_deadline,
          application_link: formData.application_link || null,
          requirements: formData.requirements
            ? formData.requirements.split(',').map(r => r.trim()).filter(r => r)
            : [],
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (error) throw error;

      toast.success('Opportunity updated');
      router.push('/partner/opportunities');
    } catch (error: any) {
      toast.error('Failed to update opportunity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this opportunity?')) return;

    try {
      const { error } = await supabase
        .from('partner_opportunities')
        .delete()
        .eq('id', params.id);

      if (error) throw error;

      toast.success('Opportunity deleted');
      router.push('/partner/opportunities');
    } catch (error: any) {
      toast.error('Failed to delete opportunity');
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
      <Link href="/partner/opportunities">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Opportunities
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Edit Opportunity</h1>
        <p className="text-muted-foreground">Update opportunity details</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData({ ...formData, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="apprenticeship">Apprenticeship</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Lagos, Nigeria"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="remote">Remote Option</Label>
                <Select
                  value={formData.remote_option ? 'yes' : 'no'}
                  onValueChange={(val) => setFormData({ ...formData, remote_option: val === 'yes' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes - Remote/Hybrid Available</SelectItem>
                    <SelectItem value="no">No - On-site Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="application_link">Application Link (Optional)</Label>
              <Input
                id="application_link"
                type="url"
                placeholder="https://example.com/apply"
                value={formData.application_link}
                onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                External application URL (if not using the platform's built-in application system)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (comma-separated)</Label>
              <Textarea
                id="requirements"
                placeholder="e.g., Bachelor's degree in CS, Proficiency in Python, Strong communication skills"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Separate each requirement with a comma
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
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
                Save Changes
              </>
            )}
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </form>
    </div>
  );
}