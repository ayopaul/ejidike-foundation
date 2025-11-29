/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/users/page.tsx
 * PURPOSE: List and manage all users
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users as UsersIcon, Loader2, Eye, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = (role?: string) => {
    if (!role || role === 'all') return users;
    return users.filter(u => u.role === role);
  };

  const fetchUserApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          programs (
            title
          )
        `)
        .eq('applicant_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleViewDetails = async (user: any) => {
    setSelectedUser(user);
    setDialogOpen(true);
    setLoadingDetails(true);
    if (user.role === 'applicant') {
      await fetchUserApplications(user.id);
    }
    setLoadingDetails(false);
  };

  const UserCard = ({ user }: { user: any }) => {
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>
                {user.full_name ? getInitials(user.full_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{user.full_name || 'Unnamed User'}</CardTitle>
              <CardDescription className="mt-1">
                {user.email}
              </CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{user.role}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Joined {formatDate(user.created_at)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleViewDetails(user)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </CardContent>
      </Card>
    );
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
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage all platform users</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({users.length})</TabsTrigger>
              <TabsTrigger value="applicant">
                Applicants ({users.filter(u => u.role === 'applicant').length})
              </TabsTrigger>
              <TabsTrigger value="mentor">
                Mentors ({users.filter(u => u.role === 'mentor').length})
              </TabsTrigger>
              <TabsTrigger value="partner">
                Partners ({users.filter(u => u.role === 'partner').length})
              </TabsTrigger>
              <TabsTrigger value="admin">
                Admins ({users.filter(u => u.role === 'admin').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filterUsers(activeTab === 'all' ? undefined : activeTab).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filterUsers(activeTab === 'all' ? undefined : activeTab).map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedUser.avatar_url} />
                    <AvatarFallback>
                      {selectedUser.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{selectedUser.full_name || 'Unnamed User'}</p>
                    <DialogDescription>
                      <Badge variant="secondary" className="mt-1">{selectedUser.role}</Badge>
                    </DialogDescription>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      </div>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedUser.location && (
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{selectedUser.location}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Joined</p>
                        <p className="text-sm text-muted-foreground">{formatDate(selectedUser.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedUser.role === 'applicant' && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Applications</h4>
                    {loadingDetails ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : userApplications.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No applications submitted
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {userApplications.map((app) => (
                          <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{app.programs?.title}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(app.created_at)}</p>
                            </div>
                            <Badge>{app.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
