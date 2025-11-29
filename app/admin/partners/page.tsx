/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/partners/page.tsx
 * PURPOSE: List and manage all partner organizations
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Building2, Loader2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          partner_organizations!user_id (
            *
          )
        `)
        .eq('role', 'partner')
        .order('created_at', { ascending: false});

      if (error) {
        console.error('Error fetching partners:', error);
        toast.error(`Failed to load partners: ${error.message}`);
        throw error;
      }
      setPartners(data || []);
    } catch (error: any) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPartners = (status?: string) => {
    if (!status || status === 'all') return partners;
    const orgData = partners.filter(p => p.partner_organizations && p.partner_organizations.length > 0);
    return orgData.filter(p => p.partner_organizations[0]?.verification_status === status);
  };

  const PartnerCard = ({ partner }: { partner: any }) => {
    const org = partner.partner_organizations?.[0];
    const status = org?.verification_status || 'pending';

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={org?.logo_url || partner.avatar_url} />
              <AvatarFallback>
                <Building2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{org?.organization_name || partner.full_name}</CardTitle>
              <CardDescription className="mt-2">
                Contact: {partner.full_name}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-1">
                {partner.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Joined {formatDate(partner.created_at)}
              </p>
            </div>
            <Badge variant={
              status === 'verified' ? 'default' :
              status === 'rejected' ? 'destructive' :
              'secondary'
            }>
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Link href={`/admin/partners/${partner.id}`}>
            <Button variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
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
        <h1 className="text-3xl font-bold">Partner Organizations</h1>
        <p className="text-muted-foreground">Manage partner organizations and verify new applications</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({partners.length})</TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({partners.filter(p => p.partner_organizations?.[0]?.verification_status === 'verified').length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({partners.filter(p => !p.partner_organizations || p.partner_organizations.length === 0 || p.partner_organizations[0]?.verification_status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({partners.filter(p => p.partner_organizations?.[0]?.verification_status === 'rejected').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filterPartners(activeTab === 'all' ? undefined : activeTab).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No partners found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filterPartners(activeTab === 'all' ? undefined : activeTab).map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}