/**
 * FILE PATH: /ejdk/ejidike-foundation/components/forms/ApplicationForm.tsx
 * PURPOSE: Reusable application form component
 * USED IN: Apply page, admin review
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface ApplicationFormProps {
  programId: string;
  programTitle: string;
  draftData?: any;
}

export default function ApplicationForm({ 
  programId, 
  programTitle,
  draftData 
}: ApplicationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    motivation: draftData?.motivation || '',
    goals: draftData?.goals || '',
    experience: draftData?.experience || '',
    additional_info: draftData?.additional_info || ''
  });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Handle input change
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('applications')
        .upsert({
          program_id: programId,
          applicant_id: user.id,
          status: 'draft',
          application_data: formData
        });

      if (error) throw error;

      toast.success('Draft saved', {
        description: 'You can continue this application later'
      });

    } catch (error: any) {
      toast.error('Failed to save draft', {
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  // Submit application
  const handleSubmit = async () => {
    // Validate
    if (!formData.motivation.trim()) {
      toast.error('Motivation is required');
      return;
    }
    if (!formData.goals.trim()) {
      toast.error('Goals are required');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('applications')
        .insert({
          program_id: programId,
          applicant_id: user.id,
          status: 'submitted',
          application_data: formData,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Application submitted!', {
        description: 'We will review your application and get back to you soon.',
        action: {
          label: 'View Application',
          onClick: () => router.push(`/applications/${data.id}`)
        }
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/applications');
      }, 2000);

    } catch (error: any) {
      toast.error('Submission failed', {
        description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application for {programTitle}</CardTitle>
        <CardDescription>
          Please provide detailed responses to help us understand your needs and goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Motivation */}
        <div className="space-y-2">
          <Label htmlFor="motivation">
            Why are you applying for this program? *
          </Label>
          <Textarea
            id="motivation"
            placeholder="Explain your motivation and what makes you a good fit..."
            value={formData.motivation}
            onChange={(e) => handleChange('motivation', e.target.value)}
            rows={5}
            required
          />
          <p className="text-xs text-muted-foreground">
            {formData.motivation.length} characters
          </p>
        </div>

        {/* Goals */}
        <div className="space-y-2">
          <Label htmlFor="goals">
            What are your goals and expected outcomes? *
          </Label>
          <Textarea
            id="goals"
            placeholder="Describe what you hope to achieve..."
            value={formData.goals}
            onChange={(e) => handleChange('goals', e.target.value)}
            rows={5}
            required
          />
          <p className="text-xs text-muted-foreground">
            {formData.goals.length} characters
          </p>
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <Label htmlFor="experience">
            Relevant experience or background
          </Label>
          <Textarea
            id="experience"
            placeholder="Share any relevant experience, skills, or achievements..."
            value={formData.experience}
            onChange={(e) => handleChange('experience', e.target.value)}
            rows={4}
          />
        </div>

        {/* Additional Info */}
        <div className="space-y-2">
          <Label htmlFor="additional_info">
            Additional information
          </Label>
          <Textarea
            id="additional_info"
            placeholder="Anything else you'd like us to know..."
            value={formData.additional_info}
            onChange={(e) => handleChange('additional_info', e.target.value)}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saving || submitting}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save as Draft'
            )}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={saving || submitting}
            className="flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}