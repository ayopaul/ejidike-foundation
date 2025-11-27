/**
 * FILE PATH: /ejdk/ejidike-foundation/app/partner/candidates/page.tsx
 * PURPOSE: View and manage all candidates
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CandidatesPage() {
  const { user } = useUserProfile();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOpportunities();
    }
  }, [user]);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_opportunities')
        .select('*')
        .eq('partner_id', user?.id)
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
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">Review and manage candidate applications</p>
        </div>
        <Link href="/partner/candidates/reports">
          <Button variant="outline">View Reports</Button>
        </Link>
      </div>

      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No opportunities posted yet</p>
            <Link href="/partner/opportunities/new">
              <Button>Post Your First Opportunity</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <Card key={opp.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{opp.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {opp.opportunity_type} • Posted {new Date(opp.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Link href={`/partner/candidates/${opp.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Candidates
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="font-medium">0</span>
                    <span className="text-muted-foreground ml-1">Applications</span>
                  </div>
                  <div>
                    <span className="font-medium">0</span>
                    <span className="text-muted-foreground ml-1">Under Review</span>
                  </div>
                  <div>
                    <span className="font-medium">0</span>
                    <span className="text-muted-foreground ml-1">Shortlisted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}