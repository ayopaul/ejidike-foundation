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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
    // Section 2: Academic Background
    current_institution: '',
    program_of_study: '',
    year_of_study: '',
    previous_qualifications: '',
    // Section 3: Grant Request Details
    grant_type: '',
    amount_requested: '',
    purpose_of_grant: '',
    duration_of_support: '',
    // Section 4: Personal Statement
    academic_goals: '',
    how_grant_will_help: '',
    challenges_faced: '',
    // Legacy fields (for backward compatibility)
    motivation: '',
    goals: '',
    experience: '',
    additional_info: ''
  });

  const [declaration, setDeclaration] = useState(false);

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
    // Validate required fields
    if (!formData.current_institution.trim()) {
      toast.error('Current institution is required');
      return;
    }
    if (!formData.program_of_study.trim()) {
      toast.error('Program of study is required');
      return;
    }
    if (!formData.grant_type) {
      toast.error('Please select a grant type');
      return;
    }
    if (!formData.purpose_of_grant.trim()) {
      toast.error('Purpose of grant is required');
      return;
    }
    if (!formData.academic_goals.trim()) {
      toast.error('Academic goals are required');
      return;
    }
    if (!formData.how_grant_will_help.trim()) {
      toast.error('Please explain how the grant will help you');
      return;
    }
    if (!declaration) {
      toast.error('Please accept the declaration to submit');
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

      {/* Section 1: Applicant Information (from profile) */}
      <Card>
        <CardHeader>
          <CardTitle>Section 1: Applicant Information</CardTitle>
          <CardDescription>
            This information is from your profile. Update your profile if any details are incorrect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Full Name</Label>
              <p className="font-medium">{profile?.full_name || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Email Address</Label>
              <p className="font-medium">{profile?.email || user?.email || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Phone Number</Label>
              <p className="font-medium">{profile?.phone || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Date of Birth</Label>
              <p className="font-medium">{profile?.date_of_birth || 'Not provided'}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/profile" className="text-sm text-primary hover:underline">
              Update profile information →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Academic Background */}
      <Card>
        <CardHeader>
          <CardTitle>Section 2: Academic Background</CardTitle>
          <CardDescription>
            Fields marked with * are required
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_institution">Current Institution *</Label>
            <Input
              id="current_institution"
              placeholder="e.g., University of Nigeria, Nsukka"
              value={formData.current_institution}
              onChange={(e) => handleChange('current_institution', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="program_of_study">Program of Study *</Label>
            <Input
              id="program_of_study"
              placeholder="e.g., Computer Science, Business Administration"
              value={formData.program_of_study}
              onChange={(e) => handleChange('program_of_study', e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="year_of_study">Year of Study</Label>
              <Select
                value={formData.year_of_study}
                onValueChange={(value) => handleChange('year_of_study', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awaiting_admission">Awaiting Admission</SelectItem>
                  <SelectItem value="100_level">100 Level / Year 1</SelectItem>
                  <SelectItem value="200_level">200 Level / Year 2</SelectItem>
                  <SelectItem value="300_level">300 Level / Year 3</SelectItem>
                  <SelectItem value="400_level">400 Level / Year 4</SelectItem>
                  <SelectItem value="500_level">500 Level / Year 5</SelectItem>
                  <SelectItem value="hnd_1">HND Year 1</SelectItem>
                  <SelectItem value="hnd_2">HND Year 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="previous_qualifications">Previous Qualifications</Label>
            <Textarea
              id="previous_qualifications"
              placeholder="List your previous qualifications (e.g., WAEC, NECO, OND, etc.)"
              value={formData.previous_qualifications}
              onChange={(e) => handleChange('previous_qualifications', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Grant Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>Section 3: Grant Request Details</CardTitle>
          <CardDescription>
            Specify the type of support you are requesting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grant_type">Type of Grant Requested *</Label>
            <Select
              value={formData.grant_type}
              onValueChange={(value) => handleChange('grant_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grant type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="education_level_1">Education Grant - Level 1 (up to N500,000/year)</SelectItem>
                <SelectItem value="education_level_2">Education Grant - Level 2 (up to N300,000)</SelectItem>
                <SelectItem value="business_grant">Business Grant (up to N1,000,000)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount_requested">Amount Requested (Naira)</Label>
            <Input
              id="amount_requested"
              type="text"
              placeholder="e.g., 300,000"
              value={formData.amount_requested}
              onChange={(e) => handleChange('amount_requested', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Education Level 1: up to N500,000 | Level 2: up to N300,000 | Business: up to N1,000,000
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose_of_grant">Purpose of Grant *</Label>
            <Textarea
              id="purpose_of_grant"
              placeholder="Explain what the grant funds will be used for (e.g., tuition fees, books, equipment, business startup costs)"
              value={formData.purpose_of_grant}
              onChange={(e) => handleChange('purpose_of_grant', e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_of_support">Duration of Support Needed</Label>
            <Select
              value={formData.duration_of_support}
              onValueChange={(value) => handleChange('duration_of_support', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_semester">One Semester</SelectItem>
                <SelectItem value="one_academic_year">One Academic Year</SelectItem>
                <SelectItem value="full_program">Full Duration of Study</SelectItem>
                <SelectItem value="one_time">One-time (Business Grant)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Personal Statement */}
      <Card>
        <CardHeader>
          <CardTitle>Section 4: Personal Statement</CardTitle>
          <CardDescription>
            Help us understand your goals and circumstances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="academic_goals">
              Describe your academic goals and career aspirations *
            </Label>
            <Textarea
              id="academic_goals"
              placeholder="What do you want to achieve academically and professionally? What career path are you pursuing?"
              value={formData.academic_goals}
              onChange={(e) => handleChange('academic_goals', e.target.value)}
              rows={5}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.academic_goals.length} characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="how_grant_will_help">
              Explain how this grant will help you achieve your goals *
            </Label>
            <Textarea
              id="how_grant_will_help"
              placeholder="How will this financial support make a difference in your education or business journey?"
              value={formData.how_grant_will_help}
              onChange={(e) => handleChange('how_grant_will_help', e.target.value)}
              rows={5}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.how_grant_will_help.length} characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="challenges_faced">
              Highlight any challenges you face (financial, personal, etc.)
            </Label>
            <Textarea
              id="challenges_faced"
              placeholder="Share any obstacles or difficulties that affect your ability to pursue your education or business goals"
              value={formData.challenges_faced}
              onChange={(e) => handleChange('challenges_faced', e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {formData.challenges_faced.length} characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Supporting Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Section 5: Supporting Documents</CardTitle>
          <CardDescription>
            Please upload the required documents to support your application. All documents should be in PDF, JPG, or PNG format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {applicationId ? (
            <>
              {/* Academic Transcripts */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Academic Transcripts *</Label>
                  <span className="text-xs text-muted-foreground">(Required)</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload your most recent academic transcripts or results
                </p>
                <FileUpload
                  applicationId={applicationId}
                  documentType="academic_transcript"
                  label="Upload Academic Transcript"
                  onUploadComplete={(_url, name) => {
                    toast.success('Academic transcript uploaded', { description: name });
                  }}
                />
              </div>

              {/* Proof of Enrollment */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Proof of Enrollment / Admission Letter *</Label>
                  <span className="text-xs text-muted-foreground">(Required)</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload your admission letter or current enrollment verification
                </p>
                <FileUpload
                  applicationId={applicationId}
                  documentType="enrollment_proof"
                  label="Upload Enrollment Proof"
                  onUploadComplete={(_url, name) => {
                    toast.success('Enrollment proof uploaded', { description: name });
                  }}
                />
              </div>

              {/* Recommendation Letter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Recommendation Letter</Label>
                  <span className="text-xs text-muted-foreground">(At least one required)</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload a recommendation letter from a teacher, employer, or community leader
                </p>
                <FileUpload
                  applicationId={applicationId}
                  documentType="recommendation_letter"
                  label="Upload Recommendation Letter"
                  onUploadComplete={(_url, name) => {
                    toast.success('Recommendation letter uploaded', { description: name });
                  }}
                />
              </div>

              {/* Financial Need Statement */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Financial Need Statement *</Label>
                  <span className="text-xs text-muted-foreground">(Required)</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload proof of household income or a statement explaining your financial situation
                </p>
                <FileUpload
                  applicationId={applicationId}
                  documentType="financial_statement"
                  label="Upload Financial Statement"
                  onUploadComplete={(_url, name) => {
                    toast.success('Financial statement uploaded', { description: name });
                  }}
                />
              </div>

              {/* State of Origin Certificate */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">State of Origin Certificate *</Label>
                  <span className="text-xs text-muted-foreground">(Required for Enugu indigenes)</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload your certificate of origin or local government identification
                </p>
                <FileUpload
                  applicationId={applicationId}
                  documentType="state_of_origin"
                  label="Upload State of Origin Certificate"
                  onUploadComplete={(_url, name) => {
                    toast.success('State of origin certificate uploaded', { description: name });
                  }}
                />
              </div>

              {/* Additional Documents (Optional) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Additional Documents</Label>
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload any other supporting documents (certificates, awards, etc.)
                </p>
                <FileUpload
                  applicationId={applicationId}
                  documentType="additional_document"
                  label="Upload Additional Document"
                  onUploadComplete={(_url, name) => {
                    toast.success('Additional document uploaded', { description: name });
                  }}
                />
              </div>
            </>
          ) : (
            <div className="border border-dashed rounded-lg p-6">
              <div className="text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
                <p className="text-sm">Preparing document uploads...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 6: Declaration */}
      <Card>
        <CardHeader>
          <CardTitle>Section 6: Declaration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="declaration"
              checked={declaration}
              onCheckedChange={(checked) => setDeclaration(checked === true)}
            />
            <Label htmlFor="declaration" className="text-sm leading-relaxed cursor-pointer">
              I hereby declare that the information provided in this application is true and accurate to the best of my knowledge. I understand that providing false information may result in disqualification or revocation of any grant awarded.
            </Label>
          </div>
        </CardContent>
      </Card>

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