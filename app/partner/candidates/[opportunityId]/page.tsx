/**
 * FILE PATH: /ejdk/ejidike-foundation/app/partner/candidates/[opportunityId]/page.tsx
 * PURPOSE: View candidates for a specific opportunity
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Loader2, Mail, Phone, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function OpportunityCandidatesPage() {
  const params = useParams();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.opportunityId) {
      fetchOpportunity();
      fetchCandidates();
    }
  }, [params.opportunityId]);

  const fetchOpportunity = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_opportunities')
        .select('*')
        .eq('id', params.opportunityId)
        .single();

      if (error) throw error;
      setOpportunity(data);
    } catch (error: any) {
      console.error('Error fetching opportunity:', error);
      toast.error('Failed to load opportunity');
    }
  };

  const fetchCandidates = async () => {
    try {
      // This is a placeholder - in a real app, you'd have an applications table
      // For now, we'll show a message that this feature is coming soon
      setCandidates([]);
    } catch (error: any) {
      console.error('Error fetching candidates:', error);
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
      <Link href="/partner/candidates">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>
      </Link>

      {opportunity && (
        <div>
          <h1 className="text-3xl font-bold">{opportunity.title}</h1>
          <p className="text-muted-foreground mt-2">Candidates for this opportunity</p>
        </div>
      )}

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No candidates yet</p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            When applicants apply for this opportunity, they will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}