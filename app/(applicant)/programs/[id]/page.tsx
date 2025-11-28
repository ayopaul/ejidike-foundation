/**
 * FILE PATH: /ejdk/ejidike-foundation/app/programs/[id]/page.tsx
 * PURPOSE: View details of a specific grant program
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Program } from '@/types/database';

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createSupabaseClient();
  const { user } = useUserProfile();
  
  const [program, setProgram] = useState<Program | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProgram();
      checkApplication();
    }
  }, [params.id]);

  const fetchProgram = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setProgram(data);
    } catch (error) {
      console.error('Error fetching program:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    try {
      const { data } = await supabase
        .from('applications')
        .select('id')
        .eq('program_id', params.id)
        .eq('applicant_id', user?.id)
        .single();

      setHasApplied(!!data);
    } catch (error) {
      // No application found
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['applicant']}>
        <DashboardLayout>
          <div className="text-center py-12">Loading...</div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!program) {
    return (
      <ProtectedRoute allowedRoles={['applicant']}>
        <DashboardLayout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Program not found</p>
            <Button asChild className="mt-4">
              <Link href="/programs">Back to Programs</Link>
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['applicant']}>
     
        <div className="space-y-6">
          {/* Back Button */}
          <Button variant="ghost" asChild>
            <Link href="/programs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Link>
          </Button>

          {/* Program Header */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{program.title}</h2>
                <p className="text-muted-foreground mt-2">{program.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="default">{program.type}</Badge>
                <Badge variant="outline">{program.status}</Badge>
              </div>
            </div>
          </div>

          {/* Program Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Program Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Budget</p>
                    <p className="text-2xl font-bold">{formatCurrency(Number(program.budget))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Application Period</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(program.start_date)} - {formatDate(program.end_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground capitalize">{program.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eligibility Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                {program.eligibility_criteria && Object.keys(program.eligibility_criteria).length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    {Object.entries(program.eligibility_criteria).map(([key, value]) => (
                      <li key={key}>
                        {key}: {String(value)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific eligibility criteria listed</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Apply Section */}
          <Card>
            <CardContent className="pt-6">
              {hasApplied ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">You have already applied to this program</p>
                  <Button asChild variant="outline">
                    <Link href="/applications">View My Applications</Link>
                  </Button>
                </div>
              ) : program.status === 'open' ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Ready to apply for this program?</p>
                  <Button asChild size="lg">
                    <Link href={`/apply/${program.id}`}>Start Application</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">This program is currently not accepting applications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      
    </ProtectedRoute>
  );
}