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
import { CheckCircle, XCircle, Loader2, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function MentorApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select(`
          *,
          profiles (
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load mentor applications');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
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
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.user_id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={application.profiles?.avatar_url} />
                    <AvatarFallback>
                      {application.profiles?.full_name?.[0] || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle>{application.profiles?.full_name}</CardTitle>
                    <CardDescription className="space-y-1 mt-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {application.profiles?.email}
                      </div>
                      {application.profiles?.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {application.profiles.phone}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Expertise</h4>
                  <p className="text-sm text-muted-foreground">{application.expertise}</p>
                </div>
                {application.bio && (
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground">{application.bio}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium mb-2">Applied</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(application.created_at)}</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    className="flex-1"
                    onClick={() => handleApprove(application.user_id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleReject(application.user_id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}