/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/programs/page.tsx
 * PURPOSE: List and manage all programs
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Edit, Loader2, Calendar, Trash2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'education',
    budget: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.budget || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {

      if (editingId) {
        const { error } = await supabase
          .from('programs')
          .update({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            budget: parseFloat(formData.budget),
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Program updated');
      } else {
        const now = new Date().toISOString();
        const { error } = await supabase
          .from('programs')
          .insert({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            budget: parseFloat(formData.budget),
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
            created_at: now,
            updated_at: now
          });

        if (error) throw error;
        toast.success('Program created successfully');
      }

      setDialogOpen(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        type: 'education',
        budget: '',
        start_date: '',
        end_date: '',
        status: 'active'
      });
      fetchPrograms();
    } catch (error: any) {
      console.error('Error saving program:', error);
      toast.error('Failed to save program', {
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNewProgram = () => {
    setFormData({
      title: '',
      description: '',
      type: 'education',
      budget: '',
      start_date: '',
      end_date: '',
      status: 'active'
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (program: any) => {
    setFormData({
      title: program.title,
      description: program.description || '',
      type: program.type,
      budget: program.budget?.toString() || '',
      start_date: program.start_date?.split('T')[0] || '',
      end_date: program.end_date?.split('T')[0] || '',
      status: program.status
    });

    setEditingId(program.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this program? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Program deleted');
      fetchPrograms();
    } catch (error: any) {
      toast.error('Failed to delete program');
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Programs</h1>
          <p className="text-muted-foreground">Manage grant programs</p>
        </div>
        <Button onClick={handleNewProgram}>
          <Plus className="h-4 w-4 mr-2" />
          New Program
        </Button>
      </div>

      {/* Program Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Create New'} Program</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the program details below.' : 'Enter the details for the new program.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Program Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Tech Education Grant 2025"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the program, its goals, and what it offers..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(val) => handleChange('type', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (₦) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="5000000"
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => {
                      handleChange('start_date', e.target.value);
                      if (e.target.value) {
                        setStartDate(new Date(e.target.value));
                      }
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => {
                      handleChange('end_date', e.target.value);
                      if (e.target.value) {
                        setEndDate(new Date(e.target.value));
                      }
                    }}
                    min={formData.start_date}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingId ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {editingId ? 'Update Program' : 'Create Program'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No programs found</p>
            <Button onClick={handleNewProgram}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Program
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{program.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {program.description || 'No description'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={program.type === 'education' ? 'default' : 'secondary'}>
                      {program.type === 'education' ? 'Education' : 'Business'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatCurrency(Number(program.budget))}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatDate(program.start_date)} - {formatDate(program.end_date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      program.status === 'active' ? 'default' :
                      program.status === 'closed' ? 'destructive' :
                      'secondary'
                    }>
                      {program.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(program)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(program.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}