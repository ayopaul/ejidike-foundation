/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/content/legal/page.tsx
 * PURPOSE: Manage legal documents (Privacy Policy, Terms, etc.)
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LegalPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [legalDocs, setLegalDocs] = useState({
    privacy_policy: '',
    terms_of_service: '',
    cookie_policy: ''
  });

  useEffect(() => {
    fetchLegalDocs();
  }, []);

  const fetchLegalDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setLegalDocs({
          privacy_policy: data.privacy_policy || '',
          terms_of_service: data.terms_of_service || '',
          cookie_policy: data.cookie_policy || ''
        });
      }
    } catch (error: any) {
      console.error('Error fetching legal docs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (docType: string, content: string) => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from('legal_documents')
        .upsert({
          id: 1, // Single row for all legal docs
          [docType]: content,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Document saved');
    } catch (error: any) {
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
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
      <div>
        <h1 className="text-3xl font-bold">Legal Documents</h1>
        <p className="text-muted-foreground">Manage privacy policy, terms, and other legal content</p>
      </div>

      <Tabs defaultValue="privacy">
        <TabsList>
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="cookies">Cookie Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
              <CardDescription>How we collect, use, and protect user data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={legalDocs.privacy_policy}
                  onChange={(e) => setLegalDocs({ ...legalDocs, privacy_policy: e.target.value })}
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
              <Button 
                onClick={() => handleSave('privacy_policy', legalDocs.privacy_policy)}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Privacy Policy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
              <CardDescription>Terms and conditions for using the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={legalDocs.terms_of_service}
                  onChange={(e) => setLegalDocs({ ...legalDocs, terms_of_service: e.target.value })}
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
              <Button 
                onClick={() => handleSave('terms_of_service', legalDocs.terms_of_service)}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Terms of Service
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cookies">
          <Card>
            <CardHeader>
              <CardTitle>Cookie Policy</CardTitle>
              <CardDescription>How we use cookies and tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={legalDocs.cookie_policy}
                  onChange={(e) => setLegalDocs({ ...legalDocs, cookie_policy: e.target.value })}
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
              <Button 
                onClick={() => handleSave('cookie_policy', legalDocs.cookie_policy)}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Cookie Policy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}