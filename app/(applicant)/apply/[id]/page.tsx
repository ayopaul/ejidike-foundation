/**
 * FILE PATH: /ejdk/ejidike-foundation/app/(applicant)/apply/[programId]/page.tsx
 * PURPOSE: Application form to apply for a grant program
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner';
import Link from 'next/link';
import FileUpload from '@/components/shared/FileUpload';
import { notifyAdmins } from '@/lib/notifications';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useUserProfile();
  const draftId = searchParams.get('draft');

  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(draftId);

  const [formData, setFormData] = useState({
    motivation: '',
    goals: '',
    experience: '',
    additional_info: ''
  });

  useEffect(() => {
    if (params.id && profile) {
      fetchProgram();
      if (draftId) {
        loadDraft();
      } else {
        // Auto-create draft application so user can upload documents immediately
        createDraftApplication();
      }
    }
  }, [params.id, profile, draftId]);

  const fetchProgram = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setProgram(data);
    } catch (error: any) {
      console.error('Error fetching program:', error);
      toast.error('Failed to load program details');
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = async () => {
    if (!draftId) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', draftId)
        .single();

      if (error) throw error;

      const draftData = data as any;
      if (draftData?.application_data) {
        setFormData(draftData.application_data);
      }
    } catch (error: any) {
      console.error('Error loading draft:', error);
      toast.error('Failed to load draft');
    }
  };

  const createDraftApplication = async () => {
    if (!profile) return;

    try {
      // Check if a draft already exists for this user and program
      const { data: existingDraft, error: checkError } = await supabase
        .from('applications')
        .select('id')
        .eq('program_id', params.id)
        .eq('applicant_id', profile.id)
        .eq('status', 'draft')
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking for existing draft:', checkError);
        return;
      }

      if (existingDraft) {
        // Use existing draft
        setApplicationId((existingDraft as any).id);
      } else {
        // Create new draft application silently
        const { data, error } = await (supabase
          .from('applications') as any)
          .insert({
            program_id: params.id,
            applicant_id: profile.id,
            status: 'draft',
            application_data: formData
          })
          .select()
          .single();

        if (error) throw error;
        setApplicationId(data.id);
      }
    } catch (error: any) {
      console.error('Error creating draft application:', error);
      // Fail silently - user can still submit without documents
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Auto-save will happen via the useEffect below
  };

  // Auto-save draft when form data changes
  useEffect(() => {
    if (!applicationId || !profile) return;

    // Debounce auto-save by 2 seconds
    const timeoutId = setTimeout(() => {
      (supabase
        .from('applications') as any)
        .update({
          application_data: formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .then(({ error }: { error: any }) => {
          if (error) {
            console.error('Auto-save failed:', error);
          }
          // Silent auto-save - no toast notification
        });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData, applicationId, profile]);

  const handleSaveDraft = async () => {
    if (!profile || !applicationId) {
      toast.error('Unable to save draft');
      return;
    }

    setSaving(true);

    try {
      // Update the auto-created draft with current form data
      const { error } = await (supabase
        .from('applications') as any)
        .update({
          application_data: formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Draft saved', {
        description: 'You can continue this application later'
      });

    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft', {
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

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

    if (!profile || !applicationId) {
      toast.error('Unable to submit application');
      return;
    }

    setSubmitting(true);

    try {
      // Update the auto-created draft to submitted status
      const { error } = await (supabase
        .from('applications') as any)
        .update({
          status: 'submitted',
          application_data: formData,
          submitted_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Notify admins about new application
      try {
        await notifyAdmins({
          title: 'New Program Application',
          message: `${profile.full_name} has submitted an application for "${program?.title}".`,
          type: 'info',
          link: `/admin/dashboard/applications/${applicationId}`,
          metadata: {
            programId: params.id,
            programTitle: program?.title,
            applicantId: profile.id,
            applicantName: profile.full_name,
            applicationId: applicationId
          }
        });
      } catch (notifError) {
        console.error('Failed to notify admins:', notifError);
        // Don't fail the submission if notification fails
      }

      toast.success('Application submitted!', {
        description: 'We will review your application and get back to you soon.',
        action: {
          label: 'View Application',
          onClick: () => router.push(`/applications/${applicationId}`)
        }
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/applications');
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error('Submission failed', {
        description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Program not found</p>
        <Link href="/browse-programs">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back Button */}
      <Link href={`/programs/${params.id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Program
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Apply for {program.title}</h1>
        <p className="text-muted-foreground mt-2">
          Please provide detailed responses to help us understand your needs and goals
        </p>
      </div>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <CardDescription>
            Fields marked with * are required
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
            <p className="text-xs text-muted-foreground">
              {formData.experience.length} characters
            </p>
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
            <p className="text-xs text-muted-foreground">
              {formData.additional_info.length} characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File Upload - Always available */}
      {applicationId ? (
        <FileUpload
          applicationId={applicationId}
          documentType="supporting_document"
          label="Upload Supporting Documents (Optional)"
          onUploadComplete={(url, name) => {
            toast.success('Document uploaded', {
              description: name
            });
          }}
        />
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6">
            <div className="text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Preparing upload...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3 pb-8">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            ✓ Your progress is automatically saved
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={saving || submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting Application...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => router.push('/applications')}
          disabled={submitting}
          className="w-full"
        >
          Save & Continue Later
        </Button>
      </div>
    </div>
  );
}