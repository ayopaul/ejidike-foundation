/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/mentors/matches/page.tsx
 * PURPOSE: View and manage mentorship matches
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Loader2, Users, ArrowRight, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function MentorMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorship_matches')
        .select(`
          *,
          mentor:profiles!mentor_id (
            id,
            full_name,
            avatar_url
          ),
          mentee:profiles!mentee_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching matches:', error);
        toast.error(`Failed to load matches: ${error.message}`);
        throw error;
      }
      setMatches(data || []);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (match: any) => {
    setSelectedMatch(match);
    setDialogOpen(true);
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
        <h1 className="text-3xl font-bold">Mentorship Matches</h1>
        <p className="text-muted-foreground">View active and pending mentor-mentee matches</p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No matches found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentor</TableHead>
                <TableHead>Mentee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={match.mentor?.avatar_url} />
                        <AvatarFallback>
                          {match.mentor?.full_name?.[0] || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{match.mentor?.full_name || 'Mentor'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={match.mentee?.avatar_url} />
                        <AvatarFallback>
                          {match.mentee?.full_name?.[0] || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{match.mentee?.full_name || 'Mentee'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={match.status === 'active' ? 'default' : 'secondary'}>
                      {match.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(match.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(match)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
        </div>
      </DashboardLayout>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMatch && (
            <>
              <DialogHeader>
                <DialogTitle>Mentorship Match Details</DialogTitle>
                <DialogDescription>
                  Match created on {formatDate(selectedMatch.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="font-semibold mb-3">Match Status</h4>
                  <Badge variant={selectedMatch.status === 'active' ? 'default' : 'secondary'}>
                    {selectedMatch.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Mentor</h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedMatch.mentor?.avatar_url} />
                        <AvatarFallback>
                          {selectedMatch.mentor?.full_name?.[0] || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedMatch.mentor?.full_name || 'Mentor'}</p>
                        <p className="text-sm text-muted-foreground">Mentor</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Mentee</h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedMatch.mentee?.avatar_url} />
                        <AvatarFallback>
                          {selectedMatch.mentee?.full_name?.[0] || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedMatch.mentee?.full_name || 'Mentee'}</p>
                        <p className="text-sm text-muted-foreground">Mentee</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedMatch.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedMatch.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-semibold mb-1 text-sm">Match ID</h4>
                    <p className="text-sm text-muted-foreground font-mono">{selectedMatch.id}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm">Created</h4>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedMatch.created_at)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}