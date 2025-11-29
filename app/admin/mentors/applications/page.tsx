/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/mentors/applications/page.tsx
 * PURPOSE: Manage mentor applications
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CheckCircle, XCircle, Loader2, Mail, Phone, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function MentorApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select(`
          *,
          profiles!user_id (
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast.error(`Failed to load mentor applications: ${error.message}`);
        throw error;
      }
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('mentor_profiles')
        .update({ 
          status: 'approved',
          availability_status: 'available'
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Mentor approved');
      fetchApplications();
    } catch (error: any) {
      toast.error('Failed to approve mentor');
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Reject this mentor application?')) return;

    try {
      const { error } = await supabase
        .from('mentor_profiles')
        .update({ status: 'rejected' })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Mentor application rejected');
      fetchApplications();
    } catch (error: any) {
      toast.error('Failed to reject application');
    }
  };

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setDialogOpen(true);
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
      <div>
        <h1 className="text-3xl font-bold">Mentor Applications</h1>
        <p className="text-muted-foreground">Review and approve mentor applications</p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No pending applications</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Expertise Areas</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={application.profiles?.avatar_url} />
                        <AvatarFallback>
                          {application.profiles?.full_name?.[0] || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{application.profiles?.full_name}</p>
                        {application.profiles?.phone && (
                          <p className="text-sm text-muted-foreground">{application.profiles.phone}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{application.profiles?.email}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate">
                      {Array.isArray(application.expertise_areas)
                        ? application.expertise_areas.join(', ')
                        : application.expertise_areas || 'Not specified'}
                    </p>
                  </TableCell>
                  <TableCell>{formatDate(application.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Pending</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(application)}
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
        </div>
      </DashboardLayout>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedApplication.profiles?.avatar_url} />
                    <AvatarFallback>
                      {selectedApplication.profiles?.full_name?.[0] || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{selectedApplication.profiles?.full_name}</p>
                    <DialogDescription>{selectedApplication.profiles?.email}</DialogDescription>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedApplication.profiles?.email}</span>
                    </div>
                    {selectedApplication.profiles?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedApplication.profiles.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Expertise Areas</h4>
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(selectedApplication.expertise_areas)
                      ? selectedApplication.expertise_areas.join(', ')
                      : selectedApplication.expertise_areas || 'Not specified'}
                  </p>
                </div>

                {selectedApplication.bio && (
                  <div>
                    <h4 className="font-semibold mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground">{selectedApplication.bio}</p>
                  </div>
                )}

                {selectedApplication.years_of_experience && (
                  <div>
                    <h4 className="font-semibold mb-2">Years of Experience</h4>
                    <p className="text-sm text-muted-foreground">{selectedApplication.years_of_experience} years</p>
                  </div>
                )}

                {selectedApplication.linkedin_url && (
                  <div>
                    <h4 className="font-semibold mb-2">LinkedIn</h4>
                    <a
                      href={selectedApplication.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {selectedApplication.linkedin_url}
                    </a>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Application Date</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedApplication.created_at)}</p>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleApprove(selectedApplication.user_id);
                      setDialogOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleReject(selectedApplication.user_id);
                      setDialogOpen(false);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}