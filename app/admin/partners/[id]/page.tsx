/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/partners/[id]/page.tsx
 * PURPOSE: View partner organization details
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Building2, Loader2, Mail, Globe, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { createNotification } from '@/lib/notifications';

export default function AdminPartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile: adminProfile } = useUserProfile();
  const [profile, setProfile] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRescindDialog, setShowRescindDialog] = useState(false);
  const [actionReason, setActionReason] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchPartner();
      fetchOpportunities();
    }
  }, [params.id]);

  const fetchPartner = async () => {
    try {
      // First fetch the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Then try to fetch the partner organization with verifier info (may not exist)
      const { data: orgData, error: orgError } = await supabase
        .from('partner_organizations')
        .select(`
          *,
          verified_by_profile:profiles!verified_by(full_name, email)
        `)
        .eq('user_id', params.id)
        .maybeSingle();

      // Only throw error if it's not a "no rows" error
      if (orgError && orgError.code !== 'PGRST116') {
        console.error('Error fetching organization:', orgError);
      }

      setOrganization(orgData);
    } catch (error: any) {
      console.error('Error fetching partner:', error);
      toast.error(`Failed to load partner details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_opportunities')
        .select('*')
        .eq('partner_id', params.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error: any) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const handleVerify = async () => {
    if (!adminProfile) {
      toast.error('Admin profile not loaded');
      return;
    }

    setVerifying(true);
    try {
      // Update organization with verification details
      const { error } = await supabase
        .from('partner_organizations')
        .update({
          verification_status: 'verified',
          verified_by: adminProfile.id,
          verified_at: new Date().toISOString()
        })
        .eq('user_id', params.id);

      if (error) throw error;

      // Send notification email
      try {
        await fetch('/api/partners/notify-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerId: params.id,
            status: 'verified',
            organizationName: organization?.organization_name
          })
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the verification if email fails
      }

      // Create in-app notification for partner
      try {
        await createNotification({
          userId: params.id as string,
          title: 'Organization Verified',
          message: `Congratulations! Your organization "${organization?.organization_name}" has been verified. You can now post opportunities and connect with applicants.`,
          type: 'success',
          link: '/partner/dashboard'
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      toast.success('Partner verified successfully');
      fetchPartner();
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error('Failed to verify partner');
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!adminProfile) {
      toast.error('Admin profile not loaded');
      return;
    }

    setVerifying(true);
    try {
      // Update organization with rejection details
      const { error } = await supabase
        .from('partner_organizations')
        .update({
          verification_status: 'rejected',
          verified_by: adminProfile.id,
          verified_at: new Date().toISOString(),
          verification_notes: actionReason || null
        })
        .eq('user_id', params.id);

      if (error) throw error;

      // Send notification email with rejection reason
      try {
        await fetch('/api/partners/notify-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerId: params.id,
            status: 'rejected',
            organizationName: organization?.organization_name,
            reason: actionReason || undefined
          })
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }

      // Create in-app notification for partner
      try {
        await createNotification({
          userId: params.id as string,
          title: 'Organization Application Update',
          message: actionReason
            ? `Your organization "${organization?.organization_name}" could not be verified. Reason: ${actionReason}`
            : `Your organization "${organization?.organization_name}" could not be verified. Please contact support for more information.`,
          type: 'warning',
          link: '/partner/organization'
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      toast.success('Partner rejected');
      setShowRejectDialog(false);
      setActionReason('');
      router.push('/admin/partners');
    } catch (error: any) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject partner');
    } finally {
      setVerifying(false);
    }
  };

  const handleRescind = async () => {
    if (!adminProfile) {
      toast.error('Admin profile not loaded');
      return;
    }

    setVerifying(true);
    try {
      // Update organization to pending status
      const { error } = await supabase
        .from('partner_organizations')
        .update({
          verification_status: 'pending',
          verified_by: adminProfile.id,
          verified_at: new Date().toISOString(),
          verification_notes: actionReason ? `Verification rescinded: ${actionReason}` : 'Verification rescinded'
        })
        .eq('user_id', params.id);

      if (error) throw error;

      // Send notification email
      try {
        await fetch('/api/partners/notify-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerId: params.id,
            status: 'rescinded',
            organizationName: organization?.organization_name,
            reason: actionReason || undefined
          })
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }

      // Create in-app notification for partner
      try {
        await createNotification({
          userId: params.id as string,
          title: 'Organization Verification Rescinded',
          message: actionReason
            ? `Your organization "${organization?.organization_name}" verification has been rescinded. Reason: ${actionReason}`
            : `Your organization "${organization?.organization_name}" verification has been rescinded. Please contact support for more information.`,
          type: 'warning',
          link: '/partner/organization'
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      toast.success('Verification rescinded');
      setShowRescindDialog(false);
      setActionReason('');
      fetchPartner();
    } catch (error: any) {
      console.error('Rescind error:', error);
      toast.error('Failed to rescind verification');
    } finally {
      setVerifying(false);
    }
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

  if (!profile) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Partner not found</p>
            <Link href="/admin/partners">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Partners
              </Button>
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
      <Link href="/admin/partners">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Partners
        </Button>
      </Link>

      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={organization?.logo_url || profile.avatar_url} />
          <AvatarFallback>
            <Building2 className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{organization?.organization_name || profile.full_name}</h1>
          {organization && (
            <Badge variant={
              organization.verification_status === 'verified' ? 'default' :
              organization.verification_status === 'rejected' ? 'destructive' :
              'secondary'
            } className="mt-2">
              {organization.verification_status}
            </Badge>
          )}
          {!organization && (
            <p className="text-sm text-muted-foreground mt-2">No organization created yet</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium">Contact Person</p>
            <p className="text-sm text-muted-foreground">{profile.full_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              {profile.email}
            </p>
          </div>
          {profile.phone && (
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">{profile.phone}</p>
            </div>
          )}
          {organization?.website && (
            <div>
              <p className="text-sm font-medium">Website</p>
              <a
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center"
              >
                <Globe className="h-4 w-4 mr-2" />
                {organization.website}
              </a>
            </div>
          )}
          {organization?.description && (
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">{organization.description}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium">Joined</p>
            <p className="text-sm text-muted-foreground">{formatDate(profile.created_at)}</p>
          </div>
          {organization?.verified_at && (
            <div>
              <p className="text-sm font-medium">
                {organization.verification_status === 'verified' ? 'Verified' : 'Reviewed'} By
              </p>
              <p className="text-sm text-muted-foreground">
                {organization.verified_by_profile?.full_name || 'Unknown Admin'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(organization.verified_at)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons based on status */}
      {organization?.verification_status === 'pending' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={handleVerify}
                disabled={verifying || !adminProfile}
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Partner
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setShowRejectDialog(true)}
                disabled={verifying || !adminProfile}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {organization?.verification_status === 'verified' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">This partner is verified</span>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowRescindDialog(true)}
                disabled={verifying || !adminProfile}
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Rescind Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {organization?.verification_status === 'rejected' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">This partner was rejected</span>
              </div>
              <Button
                onClick={handleVerify}
                disabled={verifying || !adminProfile}
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Partner
                  </>
                )}
              </Button>
            </div>
            {organization?.verification_notes && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Rejection Notes:</p>
                <p className="text-sm text-muted-foreground">{organization.verification_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Posted Opportunities</CardTitle>
          <CardDescription>
            {opportunities.length} opportunities posted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No opportunities posted yet
            </p>
          ) : (
            <div className="space-y-2">
              {opportunities.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{opp.title}</p>
                    <p className="text-sm text-muted-foreground">{opp.opportunity_type}</p>
                  </div>
                  <Badge>{opp.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Partner</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this partner? They will be notified via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection Reason (optional)</Label>
              <Textarea
                id="reject-reason"
                placeholder="Provide a reason for rejection that will be shared with the partner..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be included in the rejection email sent to the partner.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setActionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Partner'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rescind Dialog */}
      <Dialog open={showRescindDialog} onOpenChange={setShowRescindDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rescind Verification</DialogTitle>
            <DialogDescription>
              This will remove the verified status from this partner. They will no longer be able to create new opportunities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rescind-reason">Reason for Rescinding (optional)</Label>
              <Textarea
                id="rescind-reason"
                placeholder="Provide a reason for rescinding verification..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be included in the notification sent to the partner.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRescindDialog(false);
                setActionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRescind}
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Rescind Verification'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}