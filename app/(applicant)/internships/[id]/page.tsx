/**
 * FILE PATH: /ejdk/ejidike-foundation/app/(applicant)/internships/[id]/page.tsx
 * PURPOSE: View details of a specific internship opportunity
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  ExternalLink,
  Loader2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InternshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOpportunity();
    }
  }, [params.id]);

  const fetchOpportunity = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_opportunities')
        .select(`
          *,
          partner:partner_organizations(
            organization_name,
            logo_url,
            website,
            description
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setOpportunity(data);
    } catch (error: any) {
      console.error('Error fetching opportunity:', error);
      toast.error('Failed to load internship details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    // In a real app, this would open an application form or redirect to external URL
    toast.info('Application process', {
      description: 'Contact the organization directly to apply for this opportunity'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Opportunity not found</p>
        <Link href="/internships">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Internships
          </Button>
        </Link>
      </div>
    );
  }

  const isOpen = opportunity.status === 'open' && 
    (!opportunity.application_deadline || new Date(opportunity.application_deadline) > new Date());

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/internships">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Internships
        </Button>
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="default" className="capitalize">
            {opportunity.opportunity_type}
          </Badge>
          <Badge variant={isOpen ? 'default' : 'destructive'}>
            {isOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold">{opportunity.title}</h1>
      </div>

      {/* Organization Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={opportunity.partner?.logo_url} />
              <AvatarFallback>
                <Building2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {opportunity.partner?.organization_name || 'Partner Organization'}
              </h3>
              {opportunity.partner?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {opportunity.partner.description}
                </p>
              )}
              {opportunity.partner?.website && (
                <a 
                  href={opportunity.partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                >
                  Visit website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Details */}
      <div className="grid gap-6 md:grid-cols-3">
        {opportunity.location && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{opportunity.location}</p>
            </CardContent>
          </Card>
        )}

        {opportunity.duration && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{opportunity.duration}</p>
            </CardContent>
          </Card>
        )}

        {opportunity.application_deadline && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Deadline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{formatDate(opportunity.application_deadline)}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>About This Opportunity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {opportunity.description}
          </p>
        </CardContent>
      </Card>

      {/* Requirements */}
      {opportunity.requirements && (
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>
              Make sure you meet these requirements before applying
            </CardDescription>
          </CardHeader>
          <CardContent>
            {typeof opportunity.requirements === 'object' && !Array.isArray(opportunity.requirements) ? (
              <ul className="space-y-2">
                {Object.entries(opportunity.requirements).map(([key, value]) => (
                  <li key={key} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong> {String(value)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {String(opportunity.requirements)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {opportunity.benefits && (
        <Card>
          <CardHeader>
            <CardTitle>What You'll Gain</CardTitle>
          </CardHeader>
          <CardContent>
            {typeof opportunity.benefits === 'object' && !Array.isArray(opportunity.benefits) ? (
              <ul className="space-y-2">
                {Object.entries(opportunity.benefits).map(([key, value]) => (
                  <li key={key} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong> {String(value)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {String(opportunity.benefits)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Application Instructions */}
      {opportunity.application_instructions && (
        <Card>
          <CardHeader>
            <CardTitle>How to Apply</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {opportunity.application_instructions}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {isOpen ? (
              <Button className="flex-1" size="lg" onClick={handleApply}>
                Apply Now
              </Button>
            ) : (
              <Button className="flex-1" size="lg" disabled>
                Applications Closed
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push('/internships')}>
              Browse Other Opportunities
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}