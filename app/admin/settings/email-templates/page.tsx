'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Loader2,
  Mail,
  ChevronLeft,
  Eye,
  FileText,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface TemplateGroup {
  category: string;
  templates: Template[];
}

interface TemplatePreview {
  id: string;
  name: string;
  category: string;
  description: string;
  subject: string;
  html: string;
  text: string;
}

export default function EmailTemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [groups, setGroups] = useState<TemplateGroup[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreview | null>(null);
  const [showHtml, setShowHtml] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setGroups(data.grouped || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (templateId: string) => {
    setLoadingPreview(true);
    try {
      const response = await fetch(`/api/admin/email-templates?id=${templateId}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSelectedTemplate(data);
    } catch (error) {
      console.error('Error fetching template preview:', error);
      toast.error('Failed to load template preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCopyHtml = async () => {
    if (!selectedTemplate) return;

    try {
      await navigator.clipboard.writeText(selectedTemplate.html);
      setCopied(true);
      toast.success('HTML copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy HTML');
    }
  };

  const categoryIcons: Record<string, string> = {
    'Applications': '📋',
    'Partners': '🤝',
    'Welcome': '👋',
    'Mentors': '🎓',
    'Mentorship': '🌟',
    'Authentication': '🔐',
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
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/admin/settings">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Mail className="h-8 w-8" />
                Email Templates
              </h1>
              <p className="text-muted-foreground">
                Preview all email templates used by the platform
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template List */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Templates</CardTitle>
                  <CardDescription>
                    Click on a template to preview it
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {groups.map((group) => (
                    <div key={group.category}>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span>{categoryIcons[group.category] || '📧'}</span>
                        {group.category}
                      </h3>
                      <div className="space-y-2">
                        {group.templates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handlePreview(template.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-all hover:border-primary hover:bg-primary/5 ${
                              selectedTemplate?.id === template.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border'
                            }`}
                          >
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6' : ''}`}>
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Preview
                    </CardTitle>
                    {selectedTemplate && (
                      <CardDescription className="mt-1">
                        <strong>Subject:</strong> {selectedTemplate.subject}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTemplate && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowHtml(!showHtml)}
                        >
                          {showHtml ? (
                            <>
                              <FileText className="h-4 w-4 mr-1" />
                              Plain Text
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4 mr-1" />
                              HTML
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyHtml}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                          {isFullscreen ? (
                            <Minimize2 className="h-4 w-4" />
                          ) : (
                            <Maximize2 className="h-4 w-4" />
                          )}
                        </Button>
                        {isFullscreen && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFullscreen(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingPreview ? (
                    <div className="flex items-center justify-center h-[500px]">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : selectedTemplate ? (
                    <div className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'}`}>
                      {showHtml ? (
                        <iframe
                          srcDoc={selectedTemplate.html}
                          className="w-full h-full border rounded-lg bg-white"
                          title="Email Preview"
                        />
                      ) : (
                        <div className="w-full h-full overflow-auto p-4 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap">
                          {selectedTemplate.text}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
                      <Mail className="h-16 w-16 mb-4 opacity-20" />
                      <p>Select a template to preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">About Email Templates</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    These templates are automatically sent when specific actions occur on the platform.
                    The preview shows sample data - actual emails will contain real user information.
                    All templates are designed to work across email clients and support dark mode.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
