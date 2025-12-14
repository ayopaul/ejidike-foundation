/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/dashboard/applications/[id]/page.tsx
 * PURPOSE: Admin view of specific application with review controls
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, Calendar, User, Loader2, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import ApplicationReview from '@/components/admin/ApplicationReview';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

function ApplicationDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchApplication();
      fetchDocuments();
    }
  }, [params.id]);

  const fetchApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          programs (
            title,
            type,
            budget
          ),
          applicant:profiles!applicant_id (
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setApplication(data);
      setApplicant(data.applicant);
    } catch (error: any) {
      console.error('Error fetching application:', error);
      toast.error('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', params.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
    }
  };

  const downloadDocument = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('application-documents')
        .download(filePath);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Document downloaded');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Application not found</p>
        <Link href="/admin/dashboard/applications">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/dashboard/applications">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
      </Link>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <Badge variant={getStatusColor(application.status)}>
            {application.status}
          </Badge>
          <Badge variant="outline">
            {application.programs?.type === 'education' ? 'Education' : 'Business'}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold">{application.programs?.title}</h1>
        <p className="text-muted-foreground mt-2">Application ID: {application.id}</p>
      </div>

      {/* Applicant Info */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">{applicant?.full_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{applicant?.email}</p>
          </div>
          {applicant?.phone && (
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">{applicant.phone}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Application Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">{formatDate(application.created_at)}</p>
            </div>
          </div>
          {application.submitted_at && (
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Submitted</p>
                <p className="text-sm text-muted-foreground">{formatDate(application.submitted_at)}</p>
              </div>
            </div>
          )}
          {application.reviewed_at && (
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Reviewed</p>
                <p className="text-sm text-muted-foreground">{formatDate(application.reviewed_at)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Data */}
      {application.application_data && (
        <>
          {/* Academic Background */}
          {(application.application_data.current_institution || application.application_data.program_of_study) && (
            <Card>
              <CardHeader>
                <CardTitle>Academic Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.application_data.current_institution && (
                  <div>
                    <p className="text-sm font-medium">Current Institution</p>
                    <p className="text-sm text-muted-foreground">{application.application_data.current_institution}</p>
                  </div>
                )}
                {application.application_data.program_of_study && (
                  <div>
                    <p className="text-sm font-medium">Program of Study</p>
                    <p className="text-sm text-muted-foreground">{application.application_data.program_of_study}</p>
                  </div>
                )}
                {application.application_data.year_of_study && (
                  <div>
                    <p className="text-sm font-medium">Year of Study</p>
                    <p className="text-sm text-muted-foreground">{application.application_data.year_of_study.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                  </div>
                )}
                {application.application_data.previous_qualifications && (
                  <div>
                    <p className="text-sm font-medium">Previous Qualifications</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.application_data.previous_qualifications}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Grant Request Details */}
          {(application.application_data.grant_type || application.application_data.purpose_of_grant) && (
            <Card>
              <CardHeader>
                <CardTitle>Grant Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.application_data.grant_type && (
                  <div>
                    <p className="text-sm font-medium">Type of Grant Requested</p>
                    <p className="text-sm text-muted-foreground">
                      {application.application_data.grant_type === 'education_level_1' ? 'Education Grant - Level 1 (up to N500,000/year)' :
                       application.application_data.grant_type === 'education_level_2' ? 'Education Grant - Level 2 (up to N300,000)' :
                       application.application_data.grant_type === 'business_grant' ? 'Business Grant (up to N1,000,000)' :
                       application.application_data.grant_type}
                    </p>
                  </div>
                )}
                {application.application_data.amount_requested && (
                  <div>
                    <p className="text-sm font-medium">Amount Requested</p>
                    <p className="text-sm text-muted-foreground">₦{application.application_data.amount_requested}</p>
                  </div>
                )}
                {application.application_data.purpose_of_grant && (
                  <div>
                    <p className="text-sm font-medium">Purpose of Grant</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.application_data.purpose_of_grant}</p>
                  </div>
                )}
                {application.application_data.duration_of_support && (
                  <div>
                    <p className="text-sm font-medium">Duration of Support Needed</p>
                    <p className="text-sm text-muted-foreground">{application.application_data.duration_of_support.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Personal Statement */}
          {(application.application_data.academic_goals || application.application_data.how_grant_will_help || application.application_data.challenges_faced) && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Statement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.application_data.academic_goals && (
                  <div>
                    <h3 className="font-medium mb-2">Academic Goals & Career Aspirations</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.application_data.academic_goals}</p>
                  </div>
                )}
                {application.application_data.how_grant_will_help && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">How This Grant Will Help</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.application_data.how_grant_will_help}</p>
                    </div>
                  </>
                )}
                {application.application_data.challenges_faced && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Challenges Faced</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.application_data.challenges_faced}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Legacy Fields (for older applications) */}
          {(application.application_data.motivation || application.application_data.goals || application.application_data.experience) && (
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.application_data.motivation && (
                  <div>
                    <h3 className="font-medium mb-2">Motivation</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {application.application_data.motivation}
                    </p>
                  </div>
                )}
                {application.application_data.goals && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Goals</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {application.application_data.goals}
                      </p>
                    </div>
                  </>
                )}
                {application.application_data.experience && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Experience</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {application.application_data.experience}
                      </p>
                    </div>
                  </>
                )}
                {application.application_data.additional_info && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Additional Information</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {application.application_data.additional_info}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
            <CardDescription>
              {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Group documents by type */}
              {[
                { type: 'academic_transcript', label: 'Academic Transcripts' },
                { type: 'enrollment_proof', label: 'Proof of Enrollment / Admission Letter' },
                { type: 'recommendation_letter', label: 'Recommendation Letters' },
                { type: 'financial_statement', label: 'Financial Need Statement' },
                { type: 'state_of_origin', label: 'State of Origin Certificate' },
                { type: 'additional_document', label: 'Additional Documents' },
                { type: 'supporting_document', label: 'Other Documents' },
              ].map(({ type, label }) => {
                const typeDocs = documents.filter((doc: any) => doc.document_type === type);
                if (typeDocs.length === 0) return null;
                return (
                  <div key={type} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
                    {typeDocs.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded {formatDate(doc.uploaded_at)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(doc.file_path, doc.file_name)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Component */}
      {application.status === 'submitted' && (
        <ApplicationReview
          applicationId={application.id}
          applicantName={applicant?.full_name}
          programTitle={application.programs?.title}
          onReviewComplete={() => {
            fetchApplication();
            router.push('/admin/dashboard/applications');
          }}
        />
      )}

      {/* Reviewer Notes (if already reviewed) */}
      {application.reviewer_notes && (
        <Card className={
          application.status === 'approved' ? 'border-green-200 bg-green-50' :
          application.status === 'rejected' ? 'border-red-200 bg-red-50' :
          ''
        }>
          <CardHeader>
            <CardTitle>Reviewer Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{application.reviewer_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminApplicationDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <ApplicationDetailContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}