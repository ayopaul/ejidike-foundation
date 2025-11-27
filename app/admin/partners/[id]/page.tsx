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
import { ArrowLeft, Building2, Loader2, Mail, Globe, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminPartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPartner();
      fetchOpportunities();
    }
  }, [params.id]);

  const fetchPartner = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_organizations')
        .select(`
          *,
          profile:profiles!user_id (
            full_name,
            email
          )
        `)
        .eq('user_id', params.id)
        .single();

      if (error) throw error;
      setPartner(data);
    } catch (error: any) {
      console.error('Error fetching partner:', error);
      toast.error('Failed to load partner details');
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
    try {
      const { error } = await supabase
        .from('partner_organizations')
        .update({ verification_status: 'verified' })
        .eq('user_id', params.id);

      if (error) throw error;

      toast.success('Partner verified');
      fetchPartner();
    } catch (error: any) {
      toast.error('Failed to verify partner');
    }
  };

  const handleReject = async () => {
    if (!confirm('Reject this partner?')) return;

    try {
      const { error } = await supabase
        .from('partner_organizations')
        .update({ verification_status: 'rejected' })
        .eq('user_id', params.id);

      if (error) throw error;

      toast.success('Partner rejected');
      router.push('/admin/partners');
    } catch (error: any) {
      toast.error('Failed to reject partner');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Partner not found</p>
        <Link href="/admin/partners">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partners
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/partners">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Partners
        </Button>
      </Link>

      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={partner.logo_url} />
          <AvatarFallback>
            <Building2 className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{partner.organization_name}</h1>
          <Badge variant={
            partner.verification_status === 'verified' ? 'default' :
            partner.verification_status === 'rejected' ? 'destructive' :
            'secondary'
          } className="mt-2">
            {partner.verification_status}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium">Contact Person</p>
            <p className="text-sm text-muted-foreground">{partner.profile?.full_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              {partner.profile?.email}
            </p>
          </div>
          {partner.website && (
            <div>
              <p className="text-sm font-medium">Website</p>
              <a 
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center"
              >
                <Globe className="h-4 w-4 mr-2" />
                {partner.website}
              </a>
            </div>
          )}
          {partner.description && (
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">{partner.description}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium">Joined</p>
            <p className="text-sm text-muted-foreground">{formatDate(partner.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      {partner.verification_status === 'pending' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleVerify}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Partner
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleReject}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
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
    </div>
  );
}