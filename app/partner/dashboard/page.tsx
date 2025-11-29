'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase,
  Users,
  Eye,
  Plus,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function PartnerDashboard() {
  const { user } = useUserProfile();
  const supabase = createSupabaseClient();
  
  const [organization, setOrganization] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    activeOpportunities: 0,
    totalViews: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch partner organization
      const { data: org } = await supabase
        .from('partner_organizations')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setOrganization(org);

      // Fetch opportunities (only if organization exists)
      let opps: any[] = [];
      if (org) {
        const { data: opportunitiesData } = await supabase
          .from('partner_opportunities')
          .select('*')
          .eq('partner_id', org.id)
          .order('created_at', { ascending: false });

        opps = opportunitiesData || [];
      }

      setOpportunities(opps || []);

      // Calculate stats
      const totalOpportunities = opps?.length || 0;
      const activeOpportunities = opps?.filter(o => o.status === 'open').length || 0;

      setStats({
        totalOpportunities,
        activeOpportunities,
        totalViews: 0, // Would track this separately
        totalApplications: 0, // Would count from applications table
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatus = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      pending: { label: 'Pending Verification', variant: 'secondary' },
      verified: { label: 'Verified', variant: 'default' },
      rejected: { label: 'Verification Failed', variant: 'destructive' },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {organization?.organization_name || 'Partner Dashboard'}
            </h2>
            <p className="text-muted-foreground">
              Manage your opportunities and connect with talented applicants
            </p>
          </div>

          {/* Verification Status Banner */}
          {organization && organization.verification_status !== 'verified' && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Clock className="h-6 w-6 text-yellow-600" />
                    <div>
                      <CardTitle className="text-yellow-900">Verification Pending</CardTitle>
                      <CardDescription className="text-yellow-700">
                        Your organization is under review. You'll be notified once verified.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getVerificationStatus(organization.verification_status).variant}>
                    {getVerificationStatus(organization.verification_status).label}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          )}

          {organization?.verification_status === 'verified' && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle className="text-green-900">Verified Organization</CardTitle>
                    <CardDescription className="text-green-700">
                      Your organization is verified and can post opportunities
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Opportunities
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
                <p className="text-xs text-muted-foreground">
                  All time postings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Postings
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeOpportunities}</div>
                <p className="text-xs text-muted-foreground">
                  Currently accepting applications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Views
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <p className="text-xs text-muted-foreground">
                  Profile and opportunity views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Applications
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">
                  Total candidate interest
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="opportunities" className="space-y-4">
            <TabsList>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="candidates">Recent Candidates</TabsTrigger>
            </TabsList>

            <TabsContent value="opportunities" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Opportunities</CardTitle>
                    <Button asChild size="sm">
                      <Link href="/partner/opportunities/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Post New Opportunity
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {opportunities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No opportunities posted yet</p>
                      <Button asChild className="mt-4" size="sm">
                        <Link href="/partner/opportunities/new">
                          Post Your First Opportunity
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {opportunities.slice(0, 5).map((opp) => (
                        <div
                          key={opp.id}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{opp.title}</h3>
                              <Badge variant={opp.status === 'open' ? 'default' : 'secondary'}>
                                {opp.status}
                              </Badge>
                              <Badge variant="outline">{opp.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {opp.description?.substring(0, 150)}...
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {opp.location}
                                {opp.remote_option && ' (Remote OK)'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Deadline: {formatDate(opp.application_deadline)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/partner/opportunities/${opp.id}`}>
                                Edit
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/partner/candidates/${opp.id}`}>
                                View Applicants
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                      {opportunities.length > 5 && (
                        <div className="text-center pt-4">
                          <Button asChild variant="outline">
                            <Link href="/partner/opportunities">
                              View All Opportunities
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="candidates" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Candidate Activity</CardTitle>
                    <Button asChild size="sm">
                      <Link href="/partner/candidates">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No candidate activity yet</p>
                    <p className="text-sm mt-2">Applications will appear here once candidates express interest</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/partner/opportunities/new" className="flex flex-col items-center gap-2">
                  <Plus className="h-6 w-6" />
                  <span>Post Opportunity</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/partner/organization" className="flex flex-col items-center gap-2">
                  <Briefcase className="h-6 w-6" />
                  <span>Edit Organization</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/partner/candidates" className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>View Candidates</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/partner/reports" className="flex flex-col items-center gap-2">
                  <Eye className="h-6 w-6" />
                  <span>View Reports</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Organization Profile Card */}
          {organization && (
            <Card>
              <CardHeader>
                <CardTitle>Organization Profile</CardTitle>
                <CardDescription>Your public-facing information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Organization Name</p>
                      <p className="text-base">{organization.organization_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Sector</p>
                      <p className="text-base">{organization.sector}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                      <p className="text-base">{organization.contact_person}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant={getVerificationStatus(organization.verification_status).variant}>
                        {getVerificationStatus(organization.verification_status).label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{organization.description || 'No description provided'}</p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/partner/organization">
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
    </div>
  );
}