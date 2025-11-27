/**
 * FILE PATH: /ejdk/ejidike-foundation/app/(applicant)/internships/page.tsx
 * PURPOSE: Browse available internship opportunities
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock, Building2, ArrowRight, Loader2, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InternshipsPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_opportunities')
        .select(`
          *,
          partner:partner_organizations(
            organization_name,
            logo_url
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error: any) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load internships', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = 
      opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.partner?.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || opp.opportunity_type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Internship Opportunities</h1>
        <p className="text-muted-foreground mt-2">
          Explore internships and apprenticeships from our partner organizations
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search internships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="apprenticeship">Apprenticeship</SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No internships found</p>
            {(searchTerm || filterType !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => { 
                  setSearchTerm(''); 
                  setFilterType('all'); 
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="default" className="capitalize">
                    {opportunity.opportunity_type}
                  </Badge>
                  <Badge variant="outline">
                    {opportunity.status}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2">{opportunity.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Building2 className="h-4 w-4" />
                  {opportunity.partner?.organization_name || 'Partner Organization'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {opportunity.description}
                  </p>
                  
                  <div className="space-y-2">
                    {opportunity.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {opportunity.location}
                      </div>
                    )}
                    
                    {opportunity.duration && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        {opportunity.duration}
                      </div>
                    )}
                  </div>

                  {opportunity.application_deadline && (
                    <p className="text-xs text-muted-foreground">
                      Deadline: {formatDate(opportunity.application_deadline)}
                    </p>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Link href={`/internships/${opportunity.id}`} className="w-full">
                  <Button className="w-full">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Our Internship Program</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Our partner organizations offer hands-on learning experiences to help you build 
            practical skills and gain real-world exposure. Whether you're looking for an 
            internship, apprenticeship, or volunteer opportunity, we connect you with 
            reputable organizations that support youth development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}