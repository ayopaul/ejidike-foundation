/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/mentors/sessions/page.tsx
 * PURPOSE: View all mentorship sessions
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Calendar, Clock, Loader2, Video, MapPin, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function MentorSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select(`
          *,
          match:mentorship_matches!match_id (
            id,
            mentor_id,
            mentee_id,
            mentor:profiles!mentor_id (
              id,
              full_name
            ),
            mentee:profiles!mentee_id (
              id,
              full_name
            )
          )
        `)
        .order('session_date', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        toast.error(`Failed to load sessions: ${error.message}`);
        throw error;
      }
      setSessions(data || []);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (session: any) => {
    setSelectedSession(session);
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
        <h1 className="text-3xl font-bold">Mentorship Sessions</h1>
        <p className="text-muted-foreground">View all mentorship sessions</p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No sessions found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentor</TableHead>
                <TableHead>Mentee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    {session.match?.mentor?.full_name || 'N/A'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {session.match?.mentee?.full_name || 'N/A'}
                  </TableCell>
                  <TableCell>{formatDate(session.session_date)}</TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {session.duration_minutes} min
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      {session.mode === 'virtual' ? (
                        <>
                          <Video className="h-4 w-4 mr-1" />
                          Virtual
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-1" />
                          In-Person
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    {session.attendance && (
                      <Badge variant={session.attendance === 'attended' ? 'default' : 'secondary'}>
                        {session.attendance}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(session)}
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
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle>Session Details</DialogTitle>
                <DialogDescription>
                  {selectedSession.match?.mentor?.full_name} → {selectedSession.match?.mentee?.full_name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Session Date</h4>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatDate(selectedSession.session_date)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Duration</h4>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {selectedSession.duration_minutes} minutes
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Mode</h4>
                    <div className="flex items-center text-sm">
                      {selectedSession.mode === 'virtual' ? (
                        <>
                          <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                          Virtual Session
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          In-Person Session
                        </>
                      )}
                    </div>
                  </div>
                  {selectedSession.attendance && (
                    <div>
                      <h4 className="font-semibold mb-2">Attendance</h4>
                      <Badge variant={selectedSession.attendance === 'attended' ? 'default' : 'secondary'}>
                        {selectedSession.attendance}
                      </Badge>
                    </div>
                  )}
                </div>

                {selectedSession.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Session Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedSession.notes}
                    </p>
                  </div>
                )}

                {selectedSession.topics_covered && (
                  <div>
                    <h4 className="font-semibold mb-2">Topics Covered</h4>
                    <p className="text-sm text-muted-foreground">
                      {Array.isArray(selectedSession.topics_covered)
                        ? selectedSession.topics_covered.join(', ')
                        : selectedSession.topics_covered}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-1 text-sm">Session ID</h4>
                  <p className="text-sm text-muted-foreground font-mono">{selectedSession.id}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}