/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/content/faqs/page.tsx
 * PURPOSE: Manage FAQ content
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'applicant', label: 'Applicant' },
  { value: 'partner', label: 'Partner' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'programs', label: 'Programs' }
];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    general: 'bg-gray-100 text-gray-800',
    mentor: 'bg-blue-100 text-blue-800',
    applicant: 'bg-green-100 text-green-800',
    partner: 'bg-purple-100 text-purple-800',
    mentorship: 'bg-orange-100 text-orange-800',
    programs: 'bg-pink-100 text-pink-800'
  };
  return colors[category] || colors.general;
};

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general'
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error: any) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('faqs')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('FAQ updated');
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert(formData);

        if (error) throw error;
        toast.success('FAQ created');
      }

      setDialogOpen(false);
      setEditingId(null);
      setFormData({ question: '', answer: '', category: 'general' });
      fetchFAQs();
    } catch (error: any) {
      toast.error('Failed to save FAQ');
    }
  };

  const handleEdit = (faq: any) => {
    setFormData(faq);
    setEditingId(faq.id);
    setDialogOpen(true);
  };

  const handleNewFAQ = () => {
    setFormData({ question: '', answer: '', category: 'general' });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('FAQ deleted');
      fetchFAQs();
    } catch (error: any) {
      toast.error('Failed to delete FAQ');
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
          <h1 className="text-3xl font-bold">FAQs</h1>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <div className="flex gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewFAQ}>
                <Plus className="h-4 w-4 mr-2" />
                New FAQ
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Create'} FAQ</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the FAQ details below.' : 'Add a new frequently asked question.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {faqs
          .filter((faq) => categoryFilter === 'all' || faq.category === categoryFilter)
          .map((faq) => (
          <Card key={faq.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <Badge className={getCategoryColor(faq.category)}>
                      {CATEGORY_OPTIONS.find(c => c.value === faq.category)?.label || faq.category}
                    </Badge>
                  </div>
                  <CardDescription className="mt-2">{faq.answer}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={dialogOpen && editingId === faq.id} onOpenChange={(open) => {
                    if (!open) {
                      setDialogOpen(false);
                      setEditingId(null);
                      setFormData({ question: '', answer: '', category: 'general' });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(faq)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit FAQ</DialogTitle>
                        <DialogDescription>
                          Update the FAQ details below.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Question</Label>
                          <Input
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Answer</Label>
                          <Textarea
                            value={formData.answer}
                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                            rows={5}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Save</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(faq.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}