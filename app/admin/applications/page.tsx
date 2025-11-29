/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/applications/page.tsx
 * PURPOSE: Admin view of all applications with filters
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Calendar, FileText, Loader2, Search, User, Eye, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate, getStatusColor } from '@/lib/utils';
import { toast } from 'sonner';
import ApplicationReview from '@/components/admin/ApplicationReview';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // First try to fetch applications
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsError) {
        console.error('Error fetching applications:', appsError);
        toast.error(`Failed to load applications: ${appsError.message}`);
        throw appsError;
      }

      // Then fetch related data for each application
      const enrichedApps = await Promise.all(
        (appsData || []).map(async (app) => {
          // Fetch program
          const { data: program } = await supabase
            .from('programs')
            .select('title, type, budget')
            .eq('id', app.program_id)
            .single();

          // Fetch applicant profile
          const { data: applicant } = await supabase
            .from('profiles')
            .select('full_name, email, phone, avatar_url')
            .eq('id', app.applicant_id)
            .single();

          return {
            ...app,
            programs: program,
            applicant: applicant
          };
        })
      );

      setApplications(enrichedApps);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (applicationId: string) => {
    try {
      const { data, error } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', applicationId)
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

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    fetchDocuments(application.id);
    setDialogOpen(true);
  };

  const filterApplications = (status?: string) => {
    let filtered = applications;

    if (status && status !== 'all') {
      filtered = filtered.filter(app => app.status === status);
    }

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.programs?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Applications</h1>
            <p className="text-muted-foreground mt-2">
              Review and manage grant applications
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by program, applicant name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
              <TabsTrigger value="submitted">
                Submitted ({applications.filter(a => a.status === 'submitted').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({applications.filter(a => a.status === 'approved').length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({applications.filter(a => a.status === 'rejected').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filterApplications(activeTab === 'all' ? undefined : activeTab).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No applications found</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Program</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterApplications(activeTab === 'all' ? undefined : activeTab).map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.programs?.title}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{app.applicant?.full_name}</p>
                              <p className="text-xs text-muted-foreground">{app.applicant?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {app.programs?.type === 'education' ? 'Education' : 'Business'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(app.submitted_at || app.created_at)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(app.status)}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(app)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Application Details Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedApplication && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      {selectedApplication.programs?.title}
                      <Badge variant={getStatusColor(selectedApplication.status)}>
                        {selectedApplication.status}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>
                      Application ID: {selectedApplication.id}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Applicant Info */}
                    <div>
                      <h3 className="font-semibold mb-3">Applicant Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Name</p>
                          <p className="font-medium">{selectedApplication.applicant?.full_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedApplication.applicant?.email}</p>
                        </div>
                        {selectedApplication.applicant?.phone && (
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="font-medium">{selectedApplication.applicant.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Timeline */}
                    <div>
                      <h3 className="font-semibold mb-3">Timeline</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Created:</span>
                          <span>{formatDate(selectedApplication.created_at)}</span>
                        </div>
                        {selectedApplication.submitted_at && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Submitted:</span>
                            <span>{formatDate(selectedApplication.submitted_at)}</span>
                          </div>
                        )}
                        {selectedApplication.reviewed_at && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Reviewed:</span>
                            <span>{formatDate(selectedApplication.reviewed_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Application Data */}
                    {selectedApplication.application_data && (
                      <div>
                        <h3 className="font-semibold mb-3">Application Details</h3>
                        <div className="space-y-4">
                          {selectedApplication.application_data.motivation && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Motivation</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {selectedApplication.application_data.motivation}
                              </p>
                            </div>
                          )}
                          {selectedApplication.application_data.goals && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Goals</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {selectedApplication.application_data.goals}
                              </p>
                            </div>
                          )}
                          {selectedApplication.application_data.experience && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Experience</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {selectedApplication.application_data.experience}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Documents */}
                    {documents.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">
                          Supporting Documents ({documents.length})
                        </h3>
                        <div className="space-y-2">
                          {documents.map((doc) => (
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
                      </div>
                    )}

                    {/* Review Component */}
                    {selectedApplication.status === 'submitted' && (
                      <>
                        <Separator />
                        <ApplicationReview
                          applicationId={selectedApplication.id}
                          applicantName={selectedApplication.applicant?.full_name}
                          programTitle={selectedApplication.programs?.title}
                          onReviewComplete={() => {
                            setDialogOpen(false);
                            fetchApplications();
                          }}
                        />
                      </>
                    )}

                    {/* Reviewer Notes */}
                    {selectedApplication.reviewer_notes && (
                      <>
                        <Separator />
                        <div className={
                          selectedApplication.status === 'approved' ? 'bg-green-50 p-4 rounded-lg' :
                          selectedApplication.status === 'rejected' ? 'bg-red-50 p-4 rounded-lg' :
                          'bg-muted p-4 rounded-lg'
                        }>
                          <h3 className="font-semibold mb-2">Reviewer Feedback</h3>
                          <p className="text-sm whitespace-pre-wrap">
                            {selectedApplication.reviewer_notes}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
