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
        .from('partner_organizations')
        .select(`
          *,
          profile:profiles!user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      console.error('Error fetching partners:', error);
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  const filterPartners = (status?: string) => {
    if (!status || status === 'all') return partners;
    return partners.filter(p => p.verification_status === status);
  };

  const PartnerCard = ({ partner }: { partner: any }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={partner.logo_url} />
            <AvatarFallback>
              <Building2 className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle>{partner.organization_name}</CardTitle>
            <CardDescription className="mt-2">
              Contact: {partner.profile?.full_name}
            </CardDescription>
            <p className="text-xs text-muted-foreground mt-1">
              Joined {formatDate(partner.created_at)}
            </p>
          </div>
          <Badge variant={
            partner.verification_status === 'verified' ? 'default' :
            partner.verification_status === 'rejected' ? 'destructive' :
            'secondary'
          }>
            {partner.verification_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Link href={`/admin/partners/${partner.user_id}`}>
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

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
        <h1 className="text-3xl font-bold">Partner Organizations</h1>
        <p className="text-muted-foreground">Manage partner organizations and verify new applications</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({partners.length})</TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({partners.filter(p => p.verification_status === 'verified').length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({partners.filter(p => p.verification_status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({partners.filter(p => p.verification_status === 'rejected').length})
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
                <PartnerCard key={partner.user_id} partner={partner} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}