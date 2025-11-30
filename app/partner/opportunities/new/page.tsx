/**
 * FILE PATH: /ejdk/ejidike-foundation/app/partner/opportunities/new/page.tsx
 * PURPOSE: Create a new opportunity
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewOpportunityPage() {
  const router = useRouter();
  const { user, profile } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'internship',
    location: '',
    remote_option: false,
    application_deadline: '',
    application_link: '',
    requirements: ''
  });

  useEffect(() => {
    if (profile) {
      fetchOrganization();
    }
  }, [profile]);

  const fetchOrganization = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_organizations')
        .select('*')
        .eq('user_id', profile?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching organization:', error);
        return;
      }

      if (!data) {
        toast.error('Please complete your organization profile first');
        router.push('/partner/organization');
        return;
      }

      if (data.verification_status !== 'verified') {
        toast.error('Please wait for your organization to be verified before posting opportunities');
        router.push('/partner/organization');
        return;
      }

      setOrganization(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.application_deadline) {
      toast.error('Please fill in all required fields (Title and Application Deadline)');
      return;
    }

    if (!organization) {
      toast.error('Organization not found. Please complete your profile first.');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('partner_opportunities')
        .insert({
          partner_id: organization.id,
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
          status: 'open'
        });

      if (error) throw error;

      toast.success('Opportunity created successfully');
      router.push('/partner/opportunities');
    } catch (error: any) {
      console.error('Error creating opportunity:', error);
      toast.error('Failed to create opportunity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link href="/partner/opportunities">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Opportunities
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Post New Opportunity</h1>
        <p className="text-muted-foreground">Create a new internship or volunteer opportunity</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
            <CardDescription>Provide information about the opportunity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Software Engineering Intern"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the role, responsibilities, and expectations..."
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
          </CardContent>
        </Card>

        <div className="flex gap-3 mt-6">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Post Opportunity
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