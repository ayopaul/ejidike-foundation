/**
 * FILE PATH: /ejdk/ejidike-foundation/app/applications/page.tsx
 * PURPOSE: View all your grant applications (Applicant Portal)
 */

'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getStatusColor } from '@/lib/utils';

interface Application {
  id: string;
  program_id: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
  program: {
    title: string;
    type: string;
  };
}

export default function ApplicationsPage() {
  const { user, profile } = useUserProfile();
  const supabase = createSupabaseClient();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchApplications();
    }
  }, [profile]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          program:programs(title, type)
        `)
        .eq('applicant_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  const drafts = getApplicationsByStatus('draft');
  const submitted = applications.filter(app => 
    ['submitted', 'under_review'].includes(app.status)
  );
  const approved = getApplicationsByStatus('approved');
  const rejected = getApplicationsByStatus('rejected');

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{application.program?.title || 'Unknown Program'}</CardTitle>
            <CardDescription>
              {application.submitted_at 
                ? `Submitted ${formatDate(application.submitted_at)}`
                : `Draft saved ${formatDate(application.created_at)}`
              }
            </CardDescription>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/applications/${application.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>
          {application.status === 'draft' && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/apply/${application.program_id}?draft=${application.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Continue
                </Link>
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute allowedRoles={['applicant']}>
     
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">My Applications</h2>
              <p className="text-muted-foreground">
                Track and manage your grant applications
              </p>
            </div>
            <Button asChild>
              <Link href="/programs">
                <FileText className="mr-2 h-4 w-4" />
                Browse Programs
              </Link>
            </Button>
          </div>

          {/* Applications Tabs */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any applications yet
                </p>
                <Button asChild>
                  <Link href="/programs">Browse Available Programs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">
                  All ({applications.length})
                </TabsTrigger>
                <TabsTrigger value="drafts">
                  Drafts ({drafts.length})
                </TabsTrigger>
                <TabsTrigger value="submitted">
                  Submitted ({submitted.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approved.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejected.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {applications.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </TabsContent>

              <TabsContent value="drafts" className="space-y-4">
                {drafts.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No draft applications</p>
                    </CardContent>
                  </Card>
                ) : (
                  drafts.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="submitted" className="space-y-4">
                {submitted.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No submitted applications</p>
                    </CardContent>
                  </Card>
                ) : (
                  submitted.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4">
                {approved.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No approved applications</p>
                    </CardContent>
                  </Card>
                ) : (
                  approved.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                {rejected.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No rejected applications</p>
                    </CardContent>
                  </Card>
                ) : (
                  rejected.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      
    </ProtectedRoute>
  );
}