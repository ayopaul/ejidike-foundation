/**
 * FILE PATH: /ejdk/ejidike-foundation/app/partner/opportunities/page.tsx
 * PURPOSE: View and manage all opportunities
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Loader2, MapPin, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function OpportunitiesPage() {
  const { profile } = useUserProfile();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchOpportunities();
    }
  }, [profile]);

  const fetchOpportunities = async () => {
    try {
      // First get the partner organization ID
      const { data: org } = await supabase
        .from('partner_organizations')
        .select('id')
        .eq('user_id', profile?.id)
        .single();

      if (!org) {
        setOpportunities([]);
        setLoading(false);
        return;
      }

      // Then fetch opportunities for this organization
      const { data, error } = await supabase
        .from('partner_opportunities')
        .select('*')
        .eq('partner_id', org.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error: any) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">Manage your posted opportunities</p>
        </div>
        <Link href="/partner/opportunities/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Button>
        </Link>
      </div>

      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No opportunities posted yet</p>
            <Link href="/partner/opportunities/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Opportunity
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <Card key={opp.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant={opp.type === 'internship' ? 'default' : 'secondary'}>
                    {opp.type}
                  </Badge>
                  <Badge variant={opp.status === 'open' ? 'default' : 'secondary'}>
                    {opp.status}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{opp.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {opp.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {opp.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{opp.location}</span>
                      {opp.remote_option && (
                        <Badge variant="outline" className="ml-2">Remote</Badge>
                      )}
                    </div>
                  )}
                  {opp.application_deadline && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Deadline: {formatDate(opp.application_deadline)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/partner/opportunities/${opp.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}